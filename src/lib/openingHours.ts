/**
 * Преобразует OSM opening_hours (например "Mo-Fr 09:00-18:00; Sa 10:00-14:00")
 * в читаемую русскую форму ("Пн–Пт: 09:00–18:00").
 *
 * Спецификация OSM opening_hours большая, но на практике 95% данных — это
 * несколько периодов с днями недели, временем и "off". Покрываем эти случаи.
 */

const DAYS: Record<string, string> = {
  Mo: 'Пн',
  Tu: 'Вт',
  We: 'Ср',
  Th: 'Чт',
  Fr: 'Пт',
  Sa: 'Сб',
  Su: 'Вс',
  PH: 'праздники',
  SH: 'каникулы',
};

const DAY_REGEX = /\b(Mo|Tu|We|Th|Fr|Sa|Su|PH|SH)\b/g;

export function formatOpeningHours(raw: string | null | undefined): string {
  if (!raw) return '';
  const s = raw.trim();
  if (!s) return '';

  if (s === '24/7' || /^24\/7$/i.test(s)) return 'Круглосуточно';

  // разбить по ;
  const parts = s.split(';').map((p) => p.trim()).filter(Boolean);

  const translated = parts.map((p) => {
    let line = p
      .replace(DAY_REGEX, (_m, d) => DAYS[d] ?? d)
      .replace(/\boff\b/gi, 'выходной')
      .replace(/\bclosed\b/gi, 'закрыто')
      .replace(/-/g, '–'); // короткое тире

    // вставить «:» после дней перед временем, если её нет
    // пример: "Пн–Пт 09:00–18:00" → "Пн–Пт: 09:00–18:00"
    line = line.replace(
      /^([А-Яа-я ,–]+?)\s+(\d{1,2}:\d{2})/,
      '$1: $2',
    );
    return line;
  });

  return translated.join(', ');
}

/**
 * Грубая проверка, работает ли клиника по выходным.
 * Поддерживает OSM-формат (Sa/Su), русский (Сб/Вс), "ежедневно", "24/7".
 */
export function worksWeekends(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const h = raw.toLowerCase();
  if (h.includes('24/7') || h.includes('круглосуточно') || h.includes('ежедневно')) {
    return true;
  }
  // английский OSM
  if (/\b(sa|su)\b/i.test(raw) && !/\bsa\s+off|su\s+off/i.test(raw)) return true;
  // русский
  if (h.includes('сб') || h.includes('вс')) return true;
  return false;
}
