import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import type { Database } from '../../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Profile[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    let q = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200);
    if (query) q = q.ilike('full_name', `%${query}%`);
    const { data } = await q;
    setList(data ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function ban(p: Profile) {
    const reason = prompt('Причина блокировки:');
    if (reason === null) return;
    await supabase.from('profiles').update({ banned_at: new Date().toISOString(), banned_reason: reason }).eq('id', p.id);
    await load();
  }

  async function unban(p: Profile) {
    await supabase.from('profiles').update({ banned_at: null, banned_reason: null, rejected_reviews_count: 0 }).eq('id', p.id);
    await load();
  }

  async function setRole(p: Profile, role: Database['public']['Enums']['user_role']) {
    await supabase.from('profiles').update({ role }).eq('id', p.id);
    await load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-stone-800">Пользователи</h1>

      <div className="flex gap-2">
        <Input placeholder="Поиск по имени" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button size="sm" onClick={load}>Найти</Button>
      </div>

      {loading ? (
        <div className="bg-white border border-stone-200 rounded-xl p-6 text-sm text-stone-500">Загрузка…</div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
          {list.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-stone-800">{p.full_name || '—'}</div>
                <div className="text-xs text-stone-500">
                  {p.role} · {p.banned_at ? <span className="text-red-600">заблокирован</span> : 'активен'}
                  {p.rejected_reviews_count > 0 && ` · отклонённых отзывов: ${p.rejected_reviews_count}`}
                </div>
              </div>
              <div className="flex gap-2">
                {p.id !== user?.id && (
                  <>
                    <select
                      value={p.role}
                      onChange={(e) => setRole(p, e.target.value as Database['public']['Enums']['user_role'])}
                      className="text-sm border border-stone-300 rounded px-2 py-1"
                    >
                      <option value="client">Клиент</option>
                      <option value="clinic_owner">Клиника</option>
                      <option value="admin">Админ</option>
                    </select>
                    {p.banned_at ? (
                      <button onClick={() => unban(p)} className="text-sm text-emerald-700 hover:underline">Разблокировать</button>
                    ) : (
                      <button onClick={() => ban(p)} className="text-sm text-red-600 hover:underline">Блок</button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
