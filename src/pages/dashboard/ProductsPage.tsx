import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { uploadFile, sanitizeFileName } from '../../lib/storage';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyClinicHint from './shared/EmptyClinicHint';
import type { Database } from '../../lib/database.types';
import type { Clinic } from '../../hooks/useMyClinic';

type Product = Database['public']['Tables']['products']['Row'];
type OutletCtx = { clinic: Clinic | null };

export default function ProductsPage() {
  const { clinic } = useOutletContext<OutletCtx>();
  const [list, setList] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);

  async function load() {
    if (!clinic) return;
    const { data } = await supabase.from('products').select('*').eq('clinic_id', clinic.id).order('created_at', { ascending: false });
    setList(data ?? []);
  }
  useEffect(() => { void load(); }, [clinic?.id]);

  if (!clinic) return <EmptyClinicHint />;

  async function remove(id: string) {
    if (!confirm('Удалить товар?')) return;
    await supabase.from('products').delete().eq('id', id);
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Товары</h1>
        <Button size="sm" onClick={() => setEditing({ clinic_id: clinic.id, title: '', price: 0, is_active: true, currency: 'RUB' } as Product)}>Добавить товар</Button>
      </div>

      {editing && <ProductForm item={editing} clinicId={clinic.id} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void load(); }} />}

      <div className="grid md:grid-cols-2 gap-3">
        {list.length === 0 ? (
          <div className="col-span-full bg-white border border-stone-200 rounded-xl p-6 text-center text-sm text-stone-500">Товаров пока нет</div>
        ) : list.map((p) => (
          <div key={p.id} className="bg-white border border-stone-200 rounded-xl p-4 flex gap-3">
            <div className="w-20 h-20 rounded bg-stone-100 overflow-hidden flex-shrink-0">
              {p.photo_url && <img src={p.photo_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-stone-800">{p.title}</div>
              <div className="text-sm text-stone-500">{p.price} {p.currency}</div>
              <div className="mt-2 flex gap-2">
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

function ProductForm({ item, clinicId, onClose, onSaved }: { item: Product; clinicId: string; onClose: () => void; onSaved: () => void }) {
  const [p, setP] = useState(item);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const path = `${clinicId}/${sanitizeFileName(file.name)}`;
      const { publicUrl } = await uploadFile('product-photos', path, file);
      setP({ ...p, photo_url: publicUrl ?? null });
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
      price: p.price,
      currency: p.currency ?? 'RUB',
      photo_url: p.photo_url,
      stock: p.stock,
      is_active: p.is_active ?? true,
    };
    const res = p.id
      ? await supabase.from('products').update(payload).eq('id', p.id)
      : await supabase.from('products').insert(payload);
    setSaving(false);
    if (res.error) setError(res.error.message);
    else onSaved();
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded bg-stone-100 overflow-hidden">
          {p.photo_url && <img src={p.photo_url} alt="" className="w-full h-full object-cover" />}
        </div>
        <input type="file" accept="image/*" onChange={onPhoto} />
      </div>
      <Input label="Название" value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} required />
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Описание</label>
        <textarea value={p.description ?? ''} onChange={(e) => setP({ ...p, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Input type="number" step="0.01" label="Цена" value={p.price} onChange={(e) => setP({ ...p, price: Number(e.target.value) })} required />
        <Input type="number" label="Остаток" value={p.stock ?? ''} onChange={(e) => setP({ ...p, stock: e.target.value ? Number(e.target.value) : null })} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Сохраняем…' : 'Сохранить'}</Button>
        <Button size="sm" variant="outline" onClick={onClose}>Отмена</Button>
      </div>
    </div>
  );
}
