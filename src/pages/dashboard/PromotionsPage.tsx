import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { uploadFile, sanitizeFileName } from '../../lib/storage';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyClinicHint from './shared/EmptyClinicHint';
import type { Database } from '../../lib/database.types';
import type { Clinic } from '../../hooks/useMyClinic';

type Promotion = Database['public']['Tables']['promotions']['Row'];
type OutletCtx = { clinic: Clinic | null };

export default function PromotionsPage() {
  const { clinic } = useOutletContext<OutletCtx>();
  const [list, setList] = useState<Promotion[]>([]);
  const [editing, setEditing] = useState<Promotion | null>(null);

  async function load() {
    if (!clinic) return;
    const { data } = await supabase.from('promotions').select('*').eq('clinic_id', clinic.id).order('starts_at', { ascending: false });
    setList(data ?? []);
  }
  useEffect(() => { void load(); }, [clinic?.id]);

  if (!clinic) return <EmptyClinicHint />;

  async function remove(id: string) {
    if (!confirm('Удалить акцию?')) return;
    await supabase.from('promotions').delete().eq('id', id);
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Акции</h1>
        <Button size="sm" onClick={() => setEditing({ clinic_id: clinic.id, title: '', is_active: true, starts_at: new Date().toISOString() } as Promotion)}>Создать акцию</Button>
      </div>

      {editing && <PromoForm item={editing} clinicId={clinic.id} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void load(); }} />}

      <div className="grid md:grid-cols-2 gap-3">
        {list.length === 0 ? (
          <div className="col-span-full bg-white border border-stone-200 rounded-xl p-6 text-center text-sm text-stone-500">Акций пока нет</div>
        ) : list.map((p) => (
          <div key={p.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            {p.image_url && <img src={p.image_url} alt="" className="w-full h-32 object-cover" />}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-stone-800">{p.title}</h3>
                {p.discount_percent && <span className="text-accent font-bold text-sm">−{p.discount_percent}%</span>}
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {p.is_active ? <span className="text-emerald-600">Активна</span> : <span className="text-stone-400">Выключена</span>}
                {p.ends_at && ` · до ${new Date(p.ends_at).toLocaleDateString('ru')}`}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setEditing(p)} className="text-xs text-primary hover:underline">Изменить</button>
                <button onClick={() => remove(p.id)} className="text-xs text-red-600 hover:underline">Удалить</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromoForm({ item, clinicId, onClose, onSaved }: { item: Promotion; clinicId: string; onClose: () => void; onSaved: () => void }) {
  const [p, setP] = useState(item);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const path = `${clinicId}/${sanitizeFileName(file.name)}`;
      const { publicUrl } = await uploadFile('promotion-images', path, file);
      setP({ ...p, image_url: publicUrl ?? null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    }
  }

  async function save() {
    setSaving(true); setError(null);
    const payload = {
      clinic_id: clinicId,
      title: p.title,
      description: p.description,
      discount_percent: p.discount_percent,
      discount_amount: p.discount_amount,
      image_url: p.image_url,
      starts_at: p.starts_at,
      ends_at: p.ends_at,
      is_active: p.is_active ?? true,
    };
    const res = p.id
      ? await supabase.from('promotions').update(payload).eq('id', p.id)
      : await supabase.from('promotions').insert(payload);
    setSaving(false);
    if (res.error) setError(res.error.message);
    else onSaved();
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
      {p.image_url && <img src={p.image_url} alt="" className="w-full h-40 object-cover rounded" />}
      <input type="file" accept="image/*" onChange={onImage} />
      <Input label="Название" value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} required />
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Описание</label>
        <textarea value={p.description ?? ''} onChange={(e) => setP({ ...p, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Input type="number" label="Скидка %" value={p.discount_percent ?? ''} onChange={(e) => setP({ ...p, discount_percent: e.target.value ? Number(e.target.value) : null })} />
        <Input type="number" label="Скидка ₽" value={p.discount_amount ?? ''} onChange={(e) => setP({ ...p, discount_amount: e.target.value ? Number(e.target.value) : null })} />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Input type="date" label="Начало" value={p.starts_at ? new Date(p.starts_at).toISOString().slice(0,10) : ''} onChange={(e) => setP({ ...p, starts_at: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString() })} />
        <Input type="date" label="Окончание" value={p.ends_at ? new Date(p.ends_at).toISOString().slice(0,10) : ''} onChange={(e) => setP({ ...p, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!p.is_active} onChange={(e) => setP({ ...p, is_active: e.target.checked })} />
        Активна (показывается на сайте)
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Сохраняем…' : 'Сохранить'}</Button>
        <Button size="sm" variant="outline" onClick={onClose}>Отмена</Button>
      </div>
    </div>
  );
}
