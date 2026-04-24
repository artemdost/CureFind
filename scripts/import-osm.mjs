#!/usr/bin/env node
/**
 * OSM Overpass import для МедКомпас.
 *
 * Тянет медучреждения из OpenStreetMap (ODbL) по 8 городам РФ с радиусом 100 км
 * и фильтрует по 4 направлениям: Стоматология, Гинекология, Урология, Флебология.
 *
 * Записывает в таблицу clinics со статусом verification_status='pending' —
 * публично не показываются, пока не одобрены вручную/админкой.
 *
 * Использование:
 *   node scripts/import-osm.mjs           — реальный импорт
 *   node scripts/import-osm.mjs --dry-run — только посчитать, без записи
 *   node scripts/import-osm.mjs --city=Казань — один город
 *
 * Требует в .env.local:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (из Supabase → Settings → API → service_role key)
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

// ---------- parse .env.local ----------
const envPath = resolve(ROOT, '.env.local');
if (!existsSync(envPath)) {
  console.error('❌ .env.local not found');
  process.exit(1);
}
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// ---------- cli flags ----------
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT_PER_CITY_DEFAULT = 150;

if (!DRY_RUN && (!SUPABASE_URL || !SERVICE_KEY)) {
  console.error('❌ VITE_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY отсутствуют в .env.local');
  console.error('   Получить service role key: https://supabase.com/dashboard/project/_/settings/api');
  console.error('   Или запустите с --dry-run для проверки без записи.');
  process.exit(1);
}
const ONLY_CITY = args.find((a) => a.startsWith('--city='))?.slice('--city='.length);
const LIMIT_ARG = args.find((a) => a.startsWith('--limit='))?.slice('--limit='.length);
const LIMIT_PER_CITY = LIMIT_ARG === 'all' ? 0 : Number(LIMIT_ARG) || LIMIT_PER_CITY_DEFAULT;

// ---------- cities ----------
const CITIES = [
  { name: 'Москва',            lat: 55.7558, lng: 37.6173 },
  { name: 'Санкт-Петербург',   lat: 59.9343, lng: 30.3351 },
  { name: 'Нижний Новгород',   lat: 56.2965, lng: 43.9361 },
  { name: 'Казань',            lat: 55.7887, lng: 49.1221 },
  { name: 'Екатеринбург',      lat: 56.8389, lng: 60.6057 },
  { name: 'Челябинск',         lat: 55.1644, lng: 61.4368 },
  { name: 'Новосибирск',       lat: 55.0084, lng: 82.9357 },
  { name: 'Красноярск',        lat: 56.0184, lng: 92.8672 },
];

const RADIUS_M = 100_000;

// ---------- specialty detection ----------
const SPEC_RULES = [
  {
    name: 'Стоматология',
    tagPredicate: (t) =>
      t.amenity === 'dentist' ||
      t.healthcare === 'dentist' ||
      /dentist|stomatol/i.test(t['healthcare:speciality'] ?? ''),
    namePattern: /стомат|дент|dent/i,
  },
  {
    name: 'Гинекология',
    tagPredicate: (t) => /gynaecology|gynecology|obstetrics/i.test(t['healthcare:speciality'] ?? ''),
    namePattern: /гинеколог|женск|акушер/i,
  },
  {
    name: 'Урология',
    tagPredicate: (t) => /urology/i.test(t['healthcare:speciality'] ?? ''),
    namePattern: /урол|мужск/i,
  },
  {
    name: 'Флебология',
    tagPredicate: (t) => /phlebology|vascular|angiology/i.test(t['healthcare:speciality'] ?? ''),
    namePattern: /флеболог|варик|[^\S]вен[аы]|сосудист/i,
  },
];

function detectSpecialties(tags) {
  const name = tags.name ?? '';
  const result = [];
  for (const r of SPEC_RULES) {
    if (r.tagPredicate(tags) || r.namePattern.test(name)) {
      result.push(r.name);
    }
  }
  return result;
}

// ---------- overpass ----------
function buildQuery(lat, lng) {
  return `[out:json][timeout:180];
(
  nwr["amenity"="clinic"](around:${RADIUS_M},${lat},${lng});
  nwr["amenity"="dentist"](around:${RADIUS_M},${lat},${lng});
  nwr["amenity"="doctors"](around:${RADIUS_M},${lat},${lng});
  nwr["healthcare"~"^(clinic|dentist|doctor|centre)$"](around:${RADIUS_M},${lat},${lng});
);
out center tags;`;
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

async function fetchOverpass(query) {
  const backoffs = [5_000, 15_000, 30_000]; // attempts per mirror
  let lastErr;
  for (const url of OVERPASS_ENDPOINTS) {
    for (let attempt = 0; attempt < backoffs.length; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'User-Agent': 'MedKompas-OSM-Import/1.0 (info@medkompas.ru)',
          },
          body: 'data=' + encodeURIComponent(query),
        });
        if (res.ok) return await res.json();
        lastErr = new Error(`${url} → HTTP ${res.status}`);
        // retry только на "временных" ошибках
        if ([429, 502, 503, 504].includes(res.status) && attempt < backoffs.length - 1) {
          const wait = backoffs[attempt];
          console.warn(`  ⚠ ${url} HTTP ${res.status}, retry через ${wait / 1000}s...`);
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }
        break; // на других ошибках — следующее зеркало
      } catch (e) {
        lastErr = e;
        if (attempt < backoffs.length - 1) {
          const wait = backoffs[attempt];
          console.warn(`  ⚠ ${url} error: ${e.message}, retry через ${wait / 1000}s...`);
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }
        break;
      }
    }
    console.warn(`  ⚠ ${url} исчерпан, переключаюсь на следующее зеркало`);
  }
  throw lastErr ?? new Error('All Overpass mirrors failed');
}

// Скор карточки: чем выше, тем полнее информация.
// Используем для приоритизации при --limit.
function scoreClinic(c, rawTags) {
  let s = 0;
  if (rawTags['healthcare:speciality']) s += 10;
  if (c.phone) s += 5;
  const hasStreet = /,\s*[А-Яа-я]/.test(c.address); // есть улица
  if (hasStreet) s += 3;
  if (c.work_hours) s += 2;
  if (c.website) s += 2;
  if (c.email) s += 1;
  return s;
}

// ---------- mapping ----------
function coordsOf(el) {
  if (el.type === 'node') return { lat: el.lat, lng: el.lon };
  if (el.center) return { lat: el.center.lat, lng: el.center.lon };
  return null;
}

function normalizePhone(raw) {
  if (!raw) return null;
  const first = raw.split(/[;,]/)[0].trim();
  return first.slice(0, 50) || null;
}

function buildAddress(tags, city) {
  const street = tags['addr:street'];
  const house = tags['addr:housenumber'];
  const addrCity = tags['addr:city'] ?? city;
  const parts = [];
  if (street) parts.push(street + (house ? `, ${house}` : ''));
  return parts.length ? `${addrCity}, ${parts.join(', ')}`.slice(0, 300) : addrCity;
}

const TRANSLIT = {
  а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',
  к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',
  х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',
};

function slugify(name, osmId) {
  const translit = name
    .toLowerCase()
    .replace(/[а-яё]/g, (ch) => TRANSLIT[ch] ?? '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'clinic';
  const suffix = osmId.replace(/\W/g, '').slice(-10);
  return `${translit}-${suffix}`;
}

function elementToClinic(el, cityName) {
  const tags = el.tags ?? {};
  const name = tags.name?.trim();
  if (!name || name.length < 3) return null;

  const specialties = detectSpecialties(tags);
  if (specialties.length === 0) return null;

  const c = coordsOf(el);
  if (!c) return null;

  const osmId = `${el.type}/${el.id}`;
  const clinic = {
    name: name.slice(0, 200),
    slug: slugify(name, osmId),
    city: cityName,
    address: buildAddress(tags, cityName),
    lat: c.lat,
    lng: c.lng,
    phone: normalizePhone(tags.phone ?? tags['contact:phone']),
    email: (tags.email ?? tags['contact:email'])?.slice(0, 200) ?? null,
    website: (tags.website ?? tags['contact:website'])?.slice(0, 500) ?? null,
    work_hours: tags.opening_hours?.slice(0, 200) ?? null,
    specialties,
    country: 'Россия',
    verification_status: 'pending',
    description: `Импортировано из OpenStreetMap (${osmId}). Требует проверки и дополнения карточки.`,
    _osm_id: osmId,
  };
  clinic._score = scoreClinic(clinic, tags);
  return clinic;
}

// ---------- supabase ----------
const sb = DRY_RUN
  ? null
  : createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

async function findOrCreateOwner() {
  // 1. Любой существующий admin
  const { data: admins, error: e1 } = await sb
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1);
  if (e1) throw new Error(`profiles query: ${e1.message}`);
  if (admins?.[0]) return admins[0].id;

  // 2. Создать bot-пользователя
  console.log('  ℹ admin не найден, создаю bot-пользователя...');
  const { data: created, error: e2 } = await sb.auth.admin.createUser({
    email: 'osm-bot@medkompas.internal',
    password: crypto.randomUUID() + 'Aa1!',
    email_confirm: true,
    user_metadata: { full_name: 'OSM Import Bot' },
  });
  if (e2) {
    // возможно уже есть — найдём
    const { data: list } = await sb.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === 'osm-bot@medkompas.internal');
    if (existing) {
      await sb.from('profiles').upsert({ id: existing.id, role: 'admin', full_name: 'OSM Import Bot' });
      return existing.id;
    }
    throw new Error(`createUser: ${e2.message}`);
  }
  await sb
    .from('profiles')
    .upsert({ id: created.user.id, role: 'admin', full_name: 'OSM Import Bot' });
  return created.user.id;
}

async function upsertClinic(clinic, ownerId) {
  const { _osm_id, _score, ...payload } = clinic;
  // dedupe by slug
  const { data: existing } = await sb
    .from('clinics')
    .select('id')
    .eq('slug', payload.slug)
    .maybeSingle();
  if (existing) return 'skipped';

  const { error } = await sb
    .from('clinics')
    .insert({ ...payload, owner_id: ownerId });
  if (error) {
    // slug-collision fallback
    if (/duplicate key|unique/i.test(error.message)) return 'duplicate';
    console.error(`   ❌ insert "${payload.name}": ${error.message}`);
    return 'error';
  }
  return 'inserted';
}

// ---------- main ----------
async function run() {
  console.log(`🗺  OSM Overpass import ${DRY_RUN ? '(DRY RUN)' : ''}`);
  console.log(`   Supabase: ${SUPABASE_URL}`);
  const cities = ONLY_CITY ? CITIES.filter((c) => c.name === ONLY_CITY) : CITIES;
  if (cities.length === 0) {
    console.error(`❌ Город "${ONLY_CITY}" не в списке`);
    process.exit(1);
  }

  let ownerId = null;
  if (!DRY_RUN) {
    ownerId = await findOrCreateOwner();
    console.log(`   Owner: ${ownerId}`);
  }

  const totals = { fetched: 0, matched: 0, inserted: 0, skipped: 0, error: 0 };
  const specCount = { Стоматология: 0, Гинекология: 0, Урология: 0, Флебология: 0 };

  for (const city of cities) {
    console.log(`\n📍 ${city.name} (radius 100 km)`);
    const query = buildQuery(city.lat, city.lng);
    let json;
    try {
      json = await fetchOverpass(query);
    } catch (e) {
      console.error(`   ❌ Overpass error: ${e.message}`);
      continue;
    }
    const elements = json.elements ?? [];
    totals.fetched += elements.length;
    console.log(`   найдено OSM-объектов: ${elements.length}`);

    const clinics = elements
      .map((el) => elementToClinic(el, city.name))
      .filter(Boolean)
      .sort((a, b) => b._score - a._score); // лучшие карточки — первыми

    const limited = LIMIT_PER_CITY > 0 ? clinics.slice(0, LIMIT_PER_CITY) : clinics;
    totals.matched += limited.length;
    const minScore = limited.length > 0 ? limited[limited.length - 1]._score : 0;
    console.log(
      `   подходят: ${clinics.length}, беру топ ${limited.length} (min score=${minScore})`,
    );

    for (const c of limited) {
      for (const s of c.specialties) specCount[s]++;
      if (DRY_RUN) continue;
      const status = await upsertClinic(c, ownerId);
      totals[status] = (totals[status] ?? 0) + 1;
    }

    // rate-limit: 8 s между городами, чтобы не триггерить 429
    await new Promise((r) => setTimeout(r, 8000));
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ИТОГО:');
  console.log(`  OSM-объектов получено:     ${totals.fetched}`);
  console.log(`  подходит под фильтр:       ${totals.matched}`);
  if (!DRY_RUN) {
    console.log(`  вставлено в clinics:       ${totals.inserted ?? 0}`);
    console.log(`  пропущено (уже было):      ${totals.skipped ?? 0}`);
    if (totals.error) console.log(`  ошибок:                    ${totals.error}`);
  }
  console.log('\n  по специальностям (может пересекаться):');
  for (const [k, v] of Object.entries(specCount)) {
    console.log(`    ${k.padEnd(14)} ${v}`);
  }
  console.log('\n✔ done');
}

run().catch((e) => {
  console.error('\n❌ FATAL:', e);
  process.exit(1);
});
