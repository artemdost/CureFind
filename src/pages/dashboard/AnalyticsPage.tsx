import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import EmptyClinicHint from './shared/EmptyClinicHint';
import type { Database } from '../../lib/database.types';
import type { Clinic } from '../../hooks/useMyClinic';

type Event = Database['public']['Tables']['analytics_events']['Row'];
type OutletCtx = { clinic: Clinic | null };

type Period = 7 | 30 | 90;

export default function AnalyticsPage() {
  const { clinic } = useOutletContext<OutletCtx>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>(30);

  async function load() {
    if (!clinic) return;
    setLoading(true);
    const since = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('clinic_id', clinic.id)
      .gte('created_at', since)
      .order('created_at', { ascending: true });
    setEvents(data ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, [clinic?.id, period]);

  const stats = useMemo(() => {
    const counts = { impression: 0, click: 0, call: 0, search: 0, review_submit: 0, appointment_request: 0 };
    const byDay: Record<string, Record<string, number>> = {};
    const searches: Record<string, number> = {};

    events.forEach((e) => {
      counts[e.event_type as keyof typeof counts] = (counts[e.event_type as keyof typeof counts] ?? 0) + 1;
      const day = e.created_at.slice(0, 10);
      byDay[day] = byDay[day] ?? {};
      byDay[day][e.event_type] = (byDay[day][e.event_type] ?? 0) + 1;
      if (e.event_type === 'search' && e.search_query) {
        searches[e.search_query] = (searches[e.search_query] ?? 0) + 1;
      }
    });

    const topSearches = Object.entries(searches).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const days: { date: string; impression: number; click: number; call: number }[] = [];
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      days.push({
        date: d,
        impression: byDay[d]?.impression ?? 0,
        click: byDay[d]?.click ?? 0,
        call: byDay[d]?.call ?? 0,
      });
    }

    return { counts, days, topSearches };
  }, [events, period]);

  if (!clinic) return <EmptyClinicHint />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Статистика</h1>
        <div className="flex gap-1 bg-stone-100 rounded-lg p-1 text-sm">
          {[7, 30, 90].map((p) => (
            <button key={p} onClick={() => setPeriod(p as Period)} className={`px-3 py-1 rounded ${period === p ? 'bg-white' : ''}`}>
              {p} дней
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-stone-200 rounded-xl p-6 text-sm text-stone-500">Загрузка…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPI label="Показы в поиске" value={stats.counts.impression} color="bg-blue-50 text-blue-700" />
            <KPI label="Переходы на страницу" value={stats.counts.click} color="bg-emerald-50 text-emerald-700" />
            <KPI label="Звонки" value={stats.counts.call} color="bg-amber-50 text-amber-700" />
            <KPI label="Поисковые запросы" value={stats.counts.search} color="bg-purple-50 text-purple-700" />
          </div>

          <Chart days={stats.days} />

          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="font-semibold text-stone-800 mb-3">Топ поисковых запросов</h2>
            {stats.topSearches.length === 0 ? (
              <p className="text-sm text-stone-500">Нет данных по поиску за выбранный период.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {stats.topSearches.map(([q, n]) => (
                  <li key={q} className="flex justify-between border-b border-stone-100 pb-1">
                    <span className="text-stone-700">{q}</span>
                    <span className="text-stone-500">{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function KPI({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Chart({ days }: { days: { date: string; impression: number; click: number; call: number }[] }) {
  const maxVal = Math.max(1, ...days.flatMap((d) => [d.impression, d.click, d.call]));
  const width = 900;
  const height = 240;
  const pad = 30;
  const xStep = (width - pad * 2) / Math.max(1, days.length - 1);

  function pathFor(key: 'impression' | 'click' | 'call') {
    return days
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * xStep},${height - pad - (d[key] / maxVal) * (height - pad * 2)}`)
      .join(' ');
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 overflow-x-auto">
      <h2 className="font-semibold text-stone-800 mb-3">Динамика</h2>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#e7e5e4" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#e7e5e4" />
        <path d={pathFor('impression')} fill="none" stroke="#3b82f6" strokeWidth={2} />
        <path d={pathFor('click')} fill="none" stroke="#10b981" strokeWidth={2} />
        <path d={pathFor('call')} fill="none" stroke="#f59e0b" strokeWidth={2} />
        <text x={pad} y={pad - 8} fontSize={11} fill="#6b7280">макс: {maxVal}</text>
      </svg>
      <div className="flex gap-4 text-xs mt-2 text-stone-600">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500" /> Показы</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Клики</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500" /> Звонки</span>
      </div>
    </div>
  );
}
