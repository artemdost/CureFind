import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import type { Database } from '../../../lib/database.types';

type Review = Database['public']['Tables']['reviews']['Row'] & {
  author?: { full_name: string | null } | null;
  clinic?: { name: string } | null;
};

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*, author:profiles!reviews_author_id_fkey(full_name), clinic:clinics!reviews_clinic_id_fkey(name)')
      .eq('moderation_status', 'approved_by_clinic')
      .order('created_at', { ascending: false });
    setList((data as Review[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function publish(r: Review) {
    await supabase.from('reviews').update({
      moderation_status: 'approved_by_admin',
      moderated_by: user?.id,
      moderated_at: new Date().toISOString(),
    }).eq('id', r.id);
    await load();
  }

  async function reject(r: Review) {
    const note = prompt('Причина отклонения:');
    if (note === null) return;
    await supabase.from('reviews').update({
      moderation_status: 'rejected',
      moderation_note: note,
      moderated_by: user?.id,
      moderated_at: new Date().toISOString(),
    }).eq('id', r.id);
    await load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-stone-800">Отзывы — финальная модерация</h1>
      <p className="text-sm text-stone-500">
        Отзывы, одобренные клиникой. Публикуются на сайте только после вашего подтверждения.
      </p>

      {loading ? (
        <div className="bg-white border border-stone-200 rounded-xl p-6 text-sm text-stone-500">Загрузка…</div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-6 text-center text-sm text-stone-500">Очередь пуста</div>
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r.id} className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-stone-500">{r.clinic?.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium text-stone-800">{r.author?.full_name ?? 'Аноним'}</span>
                    <span className="text-star">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                </div>
                <div className="text-xs text-stone-500">{new Date(r.created_at).toLocaleString('ru')}</div>
              </div>
              <p className="mt-3 text-sm text-stone-700 whitespace-pre-line">{r.text}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => publish(r)}>Опубликовать</Button>
                <Button size="sm" variant="outline" onClick={() => reject(r)}>Отклонить</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
