import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import EmptyClinicHint from './shared/EmptyClinicHint';
import type { Database } from '../../lib/database.types';
import type { Clinic } from '../../hooks/useMyClinic';

type Review = Database['public']['Tables']['reviews']['Row'] & {
  author?: { full_name: string | null } | null;
};
type OutletCtx = { clinic: Clinic | null };

export default function ReviewsPage() {
  const { clinic } = useOutletContext<OutletCtx>();
  const { user } = useAuth();
  const [list, setList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  async function load() {
    if (!clinic) return;
    setLoading(true);
    let q = supabase
      .from('reviews')
      .select('*, author:profiles!reviews_author_id_fkey(full_name)')
      .eq('clinic_id', clinic.id)
      .order('created_at', { ascending: false });
    if (filter === 'pending') q = q.eq('moderation_status', 'pending');
    const { data } = await q;
    setList((data as Review[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, [clinic?.id, filter]);

  if (!clinic) return <EmptyClinicHint />;

  async function moderate(r: Review, action: 'approved_by_clinic' | 'rejected', note?: string) {
    await supabase
      .from('reviews')
      .update({
        moderation_status: action,
        moderation_note: note ?? null,
        moderated_by: user?.id ?? null,
        moderated_at: new Date().toISOString(),
      })
      .eq('id', r.id);
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Отзывы</h1>
        <div className="flex gap-1 bg-stone-100 rounded-lg p-1 text-sm">
          <button onClick={() => setFilter('pending')} className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-white' : ''}`}>На модерации</button>
          <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-white' : ''}`}>Все</button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-stone-200 rounded-xl p-6 text-sm text-stone-500">Загрузка…</div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-6 text-center text-sm text-stone-500">Отзывов нет</div>
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r.id} className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-800">{r.author?.full_name ?? 'Аноним'}</span>
                    <span className="text-star">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {new Date(r.created_at).toLocaleString('ru')} · повод: {
                      r.trigger_type === 'call' ? 'звонок' :
                      r.trigger_type === 'appointment' ? 'приём' : 'QR-код'
                    }
                  </div>
                </div>
                <StatusBadge status={r.moderation_status} />
              </div>
              <p className="mt-3 text-sm text-stone-700 whitespace-pre-line">{r.text}</p>
              {r.moderation_status === 'pending' && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => moderate(r, 'approved_by_clinic')}>Одобрить</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const note = prompt('Причина отклонения:');
                    if (note !== null) moderate(r, 'rejected', note);
                  }}>Отклонить</Button>
                </div>
              )}
              {r.moderation_status === 'rejected' && r.moderation_note && (
                <p className="mt-2 text-xs text-red-600">Причина: {r.moderation_note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'На модерации', cls: 'bg-amber-50 text-amber-700' },
    approved_by_clinic: { label: 'Одобрен вами', cls: 'bg-emerald-50 text-emerald-700' },
    approved_by_admin: { label: 'Опубликован', cls: 'bg-emerald-50 text-emerald-700' },
    rejected: { label: 'Отклонён', cls: 'bg-red-50 text-red-700' },
  };
  const m = map[status] ?? { label: status, cls: 'bg-stone-100 text-stone-600' };
  return <span className={`text-xs font-medium px-2 py-1 rounded ${m.cls}`}>{m.label}</span>;
}
