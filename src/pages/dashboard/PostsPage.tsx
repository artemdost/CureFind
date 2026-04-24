import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { uploadFile, sanitizeFileName } from '../../lib/storage';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyClinicHint from './shared/EmptyClinicHint';
import type { Database } from '../../lib/database.types';
import type { Clinic } from '../../hooks/useMyClinic';

type Post = Database['public']['Tables']['posts']['Row'];
type OutletCtx = { clinic: Clinic | null };

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 50) + '-' + Math.random().toString(36).slice(2, 5);
}

export default function PostsPage() {
  const { clinic } = useOutletContext<OutletCtx>();
  const [list, setList] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);

  async function load() {
    if (!clinic) return;
    const { data } = await supabase.from('posts').select('*').eq('clinic_id', clinic.id).order('created_at', { ascending: false });
    setList(data ?? []);
  }
  useEffect(() => { void load(); }, [clinic?.id]);

  if (!clinic) return <EmptyClinicHint />;

  async function remove(id: string) {
    if (!confirm('Удалить пост?')) return;
    await supabase.from('posts').delete().eq('id', id);
    await load();
  }

  async function togglePublish(p: Post) {
    await supabase.from('posts').update({ published_at: p.published_at ? null : new Date().toISOString() }).eq('id', p.id);
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Посты</h1>
        <Button size="sm" onClick={() => setEditing({ clinic_id: clinic.id, title: '', slug: '', body: '' } as Post)}>Новый пост</Button>
      </div>

      {editing && <PostForm item={editing} clinicId={clinic.id} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void load(); }} />}

      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-6 text-center text-sm text-stone-500">Постов пока нет</div>
        ) : list.map((p) => (
          <div key={p.id} className="bg-white border border-stone-200 rounded-xl p-4 flex gap-3">
            {p.cover_url && <img src={p.cover_url} alt="" className="w-20 h-20 object-cover rounded" />}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-stone-800">{p.title}</div>
              <div className="text-xs text-stone-500 mt-1">
                {p.published_at ? <span className="text-emerald-600">Опубликован</span> : <span className="text-stone-400">Черновик</span>}
              </div>
              <div className="mt-2 flex gap-3 text-xs">
                <button onClick={() => togglePublish(p)} className="text-primary hover:underline">
                  {p.published_at ? 'Снять с публикации' : 'Опубликовать'}
                </button>
                <button onClick={() => setEditing(p)} className="text-primary hover:underline">Изменить</button>
                <button onClick={() => remove(p.id)} className="text-red-600 hover:underline">Удалить</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostForm({ item, clinicId, onClose, onSaved }: { item: Post; clinicId: string; onClose: () => void; onSaved: () => void }) {
  const [p, setP] = useState(item);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const path = `${clinicId}/${sanitizeFileName(file.name)}`;
      const { publicUrl } = await uploadFile('post-covers', path, file);
      setP({ ...p, cover_url: publicUrl ?? null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    }
  }

  async function save() {
    setSaving(true); setError(null);
    const payload = {
      clinic_id: clinicId,
      title: p.title,
      slug: p.slug || slug(p.title),
      body: p.body,
      cover_url: p.cover_url,
      published_at: p.published_at,
    };
    const res = p.id
      ? await supabase.from('posts').update(payload).eq('id', p.id)
      : await supabase.from('posts').insert(payload);
    setSaving(false);
    if (res.error) setError(res.error.message);
    else onSaved();
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
      {p.cover_url && <img src={p.cover_url} alt="" className="w-full h-40 object-cover rounded" />}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Обложка</label>
        <input type="file" accept="image/*" onChange={onCover} />
      </div>
      <Input label="Заголовок" value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} required />
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Содержание</label>
        <textarea value={p.body} onChange={(e) => setP({ ...p, body: e.target.value })} rows={8} required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Сохраняем…' : 'Сохранить'}</Button>
        <Button size="sm" variant="outline" onClick={onClose}>Отмена</Button>
      </div>
    </div>
  );
}
