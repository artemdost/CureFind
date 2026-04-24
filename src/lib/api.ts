import { supabase } from './supabase';
import type { Clinic, Doctor, Region, ServicePrice } from '../data/clinics';
import type { Database } from './database.types';

type ClinicRow = Database['public']['Tables']['clinics']['Row'];
type DoctorRow = Database['public']['Tables']['doctors']['Row'];
type ServiceRow = Database['public']['Tables']['services']['Row'];

const REGION_META: Record<string, { id: string; name: string; lat: number; lng: number }> = {
  'Москва': { id: 'moscow', name: 'Москва', lat: 55.7558, lng: 37.6173 },
  'Санкт-Петербург': { id: 'spb', name: 'Санкт-Петербург', lat: 59.9343, lng: 30.3351 },
  'Казань': { id: 'kazan', name: 'Казань', lat: 55.7887, lng: 49.1221 },
  'Нижний Новгород': { id: 'nnov', name: 'Нижний Новгород', lat: 56.2965, lng: 43.9361 },
  'Саранск': { id: 'saransk', name: 'Саранск', lat: 54.1838, lng: 45.1749 },
  'Пенза': { id: 'penza', name: 'Пенза', lat: 53.1959, lng: 45.0183 },
};

function regionIdFor(city: string): string {
  return REGION_META[city]?.id ?? city.toLowerCase().replace(/\s+/g, '-');
}

const DOCTOR_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#059669',
  '#0891b2', '#dc2626', '#7c3aed', '#2563eb', '#0d9488',
];

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return DOCTOR_COLORS[Math.abs(hash) % DOCTOR_COLORS.length];
}

function mapDoctor(d: DoctorRow): Doctor {
  return {
    id: d.id,
    name: d.full_name,
    specialty: d.specialty,
    experience: d.experience_years ?? 0,
    rating: 0,
    reviewCount: 0,
    initials: initialsFor(d.full_name),
    color: colorFor(d.id),
    education: d.education ?? '',
    about: d.bio ?? '',
  };
}

function mapService(s: ServiceRow): ServicePrice {
  const price = s.price_from ?? 0;
  const oldPrice =
    s.price_to != null && s.price_from != null && s.price_to > s.price_from ? s.price_to : undefined;
  return {
    id: s.id,
    name: s.title,
    category: s.category ?? 'Прочее',
    price,
    oldPrice,
  };
}

function mapClinic(
  c: ClinicRow,
  doctors: DoctorRow[] = [],
  services: ServiceRow[] = [],
): Clinic {
  const city = c.city;
  const regionMeta = REGION_META[city];
  return {
    id: c.id,
    name: c.name,
    address: c.address,
    region: regionMeta?.name ?? city,
    regionId: regionIdFor(city),
    lat: c.lat ?? regionMeta?.lat ?? 55.7558,
    lng: c.lng ?? regionMeta?.lng ?? 37.6173,
    rating: Number(c.avg_rating) || 0,
    reviewCount: c.review_count ?? 0,
    phone: c.phone ?? '',
    workHours: c.work_hours ?? '',
    description: c.description ?? '',
    specialties: c.specialties ?? [],
    doctors: doctors.map(mapDoctor),
    services: services.map(mapService),
    verified: c.verification_status === 'approved',
    yearOpened: c.year_opened ?? new Date().getFullYear(),
  };
}

export async function fetchClinics(): Promise<Clinic[]> {
  const { data, error } = await supabase
    .from('clinics')
    .select('*, doctors(*), services(*)')
    .eq('verification_status', 'approved')
    .order('avg_rating', { ascending: false });

  if (error) {
    console.error('fetchClinics error:', error);
    return [];
  }

  type Joined = ClinicRow & { doctors: DoctorRow[]; services: ServiceRow[] };
  return (data as Joined[]).map((row) =>
    mapClinic(
      row,
      (row.doctors ?? []).filter((d) => d.is_active),
      (row.services ?? []).filter((s) => s.is_active),
    ),
  );
}

export async function fetchClinicById(id: string): Promise<Clinic | null> {
  const { data, error } = await supabase
    .from('clinics')
    .select('*, doctors(*), services(*)')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  type Joined = ClinicRow & { doctors: DoctorRow[]; services: ServiceRow[] };
  const row = data as Joined;
  return mapClinic(
    row,
    (row.doctors ?? []).filter((d) => d.is_active),
    (row.services ?? []).filter((s) => s.is_active),
  );
}

export async function fetchRegions(): Promise<Region[]> {
  const { data, error } = await supabase
    .from('clinics')
    .select('city')
    .eq('verification_status', 'approved');

  const counts: Record<string, number> = {};
  if (!error && data) {
    for (const row of data as { city: string }[]) {
      counts[row.city] = (counts[row.city] ?? 0) + 1;
    }
  }

  return Object.entries(REGION_META).map(([city, meta]) => ({
    id: meta.id,
    name: meta.name,
    lat: meta.lat,
    lng: meta.lng,
    clinicCount: counts[city] ?? 0,
  }));
}

export async function trackEvent(args: {
  eventType: 'impression' | 'click' | 'call' | 'search' | 'review_submit' | 'appointment_request';
  clinicId?: string | null;
  searchQuery?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    const { data: userRes } = await supabase.auth.getUser();
    await supabase.from('analytics_events').insert({
      event_type: args.eventType,
      clinic_id: args.clinicId ?? null,
      search_query: args.searchQuery ?? null,
      metadata: (args.metadata ?? {}) as never,
      user_id: userRes?.user?.id ?? null,
    });
  } catch {
    // silent — аналитика не должна ломать UX
  }
}

export const SPECIALTIES = [
  'Стоматология',
  'Терапия',
  'Гинекология',
  'Кардиология',
  'Неврология',
  'Офтальмология',
  'ЛОР',
  'Ортопедия',
  'Урология',
  'Дерматология',
  'Флебология',
  'УЗИ-диагностика',
];
