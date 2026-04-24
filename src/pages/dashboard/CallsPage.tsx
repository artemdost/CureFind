import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getSignedUrl } from '../../lib/storage';
import EmptyClinicHint from './shared/EmptyClinicHint';
import type { Database } from '../../lib/database.types';
import type { Clinic } from '../../hooks/useMyClinic';

type CallLog = Database['public']['Tables']['call_logs']['Row'];
type OutletCtx = { clinic: Clinic | null };

function formatDuration(sec: number | null) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CallsPage() {
  const { clinic } = useOutletContext<OutletCtx>();
  const [list, setList] = useState<CallLog[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!clinic) return;
    setLoading(true);
    const { data } = await supabase
      .from('call_logs')
      .select('*')
      .eq('clinic_id', clinic.id)
      .order('created_at', { ascending: false })
      .limit(200);
    setList(data ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, [clinic?.id]);

  if (!clinic) return <EmptyClinicHint />;

  async function loadAudio(call: CallLog) {
    if (!call.recording_url || signedUrls[call.id]) return;
    try {
      const m = call.recording_url.match(/\/call-recordings\/(.+)$/);
      const path = m?.[1] ?? call.recording_url;
      const url = await getSignedUrl('call-recordings', path, 3600);
      setSignedUrls({ ...signedUrls, [call.id]: url });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">История звонков</h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
        Звонки и записи заполняются автоматически после интеграции с телефонией
        (Mango Office / UIS / Sipuni / Telfin). Это отдельный этап — пока раздел работает на
        существующих записях.
      </div>

      {loading ? (
        <div className="bg-white border border-stone-200 rounded-xl p-6 text-sm text-stone-500">Загрузка…</div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-6 text-center text-sm text-stone-500">Звонков пока нет</div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
          {list.map((c) => (
            <div key={c.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-stone-800">{c.caller_phone ?? 'Неизвестный номер'}</div>
                  <div className="text-xs text-stone-500">
                    {new Date(c.created_at).toLocaleString('ru')} · {formatDuration(c.duration_seconds)}
                  </div>
                </div>
                {c.recording_url && (
                  <button
                    onClick={() => loadAudio(c)}
                    className="text-sm text-primary hover:underline"
                  >
                    {signedUrls[c.id] ? 'Готово' : 'Загрузить запись'}
                  </button>
                )}
              </div>
              {signedUrls[c.id] && (
                <audio src={signedUrls[c.id]} controls className="w-full mt-3" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
