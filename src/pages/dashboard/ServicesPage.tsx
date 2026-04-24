import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyClinicHint from './shared/EmptyClinicHint';
import type { Database } from '../../lib/database.types';
import type { Clinic } from '../../hooks/useMyClinic';

type Service = Database['public']['Tables']['services']['Row'];
type OutletCtx = { clinic: Clinic | null };

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 50) + '-' + Math.random().toString(36).slice(2, 5);
}

export default function ServicesPage() {
  const { clinic } = useOutletContext<OutletCtx>();
  const [list, setList] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);

  async function load() {
    if (!clinic) return;
    const { data } = await supabase.from('services').select('*').eq('clinic_id', clinic.id).order('created_at', { ascending: false });
    setList(data ?? []);
  }

  useEffect(() => { void load(); }, [clinic?.id]);

  if (!clinic) return <EmptyClinicHint />;

  async function remove(id: string) {
    if (!confirm('Удалить услугу?')) return;
    await supabase.from('services').delete().eq('id', id);
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Услуги</h1>
        <Button size="sm" onClick={() => setEditing({ clinic_id: clinic.id, title: '', slug: '', is_active: true, currency: 'RUB' } as Service)}>Добавить услугу</Button>
      </div>

      {editing && <ServiceForm item={editing} clinicId={clinic.id} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void load(); }} />}

      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {list.length === 0 ? (
          <div className="p-6 text-sm text-stone-500 text-center">Услуг пока нет</div>
        ) : list.map((s) => (
          <div key={s.id} className="p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-stone-800">{s.title}</div>
              <div className="text-sm text-stone-500">
                {s.category ? `${s.category} · ` : ''}
                {s.price_from ? `от ${s.price_from} ${s.currency}` : 'цена по запросу'}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(s)} className="text-sm text-primary hover:underline">Изменить</button>
              <button onClick={() => remove(s.id)} className="text-sm text-red-600 hover:underline">Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceForm({ item, clinicId, onClose, onSaved }: { item: Service; clinicId: string; onClose: () => void; onSaved: () => void }) {
  const [s, setS] = useState(item);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true); setError(null);
    const payload = {
      clinic_id: clinicId,
      title: s.title,
      slug: s.slug || slug(s.title),
      description: s.description,
      category: s.category,
      price_from: s.price_from,
      price_to: s.price_to,
      currency: s.currency ?? 'RUB',
      duration_minutes: s.duration_minutes,
      is_active: s.is_active ?? true,
    };
    const res = s.id
      ? await supabase.from('services').update(payload).eq('id', s.id)
      : await supabase.from('services').insert(payload);
    setSaving(false);
    if (res.error) setError(res.error.message);
    else onSaved();
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
      <Input label="Название" value={s.title} onChange={(e) => setS({ ...s, title: e.target.value })} required />
      <Input label="Категория" value={s.category ?? ''} onChange={(e) => setS({ ...s, category: e.target.value })} />
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Описание</label>
        <textarea value={s.description ?? ''} onChange={(e) => setS({ ...s, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" />
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <Input type="number" label="Цена от" value={s.price_from ?? ''} onChange={(e) => setS({ ...s, price_from: e.target.value ? Number(e.target.value) : null })} />
        <Input type="number" label="Цена до" value={s.price_to ?? ''} onChange={(e) => setS({ ...s, price_to: e.target.value ? Number(e.target.value) : null })} />
        <Input type="number" label="Минут" value={s.duration_minutes ?? ''} onChange={(e) => setS({ ...s, duration_minutes: e.target.value ? Number(e.target.value) : null })} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Сохраняем…' : 'Сохранить'}</Button>
        <Button size="sm" variant="outline" onClick={onClose}>Отмена</Button>
      </div>
    </div>
  );
}
