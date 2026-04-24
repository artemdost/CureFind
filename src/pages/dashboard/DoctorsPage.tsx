import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { uploadFile, sanitizeFileName } from '../../lib/storage';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyClinicHint from './shared/EmptyClinicHint';
import type { Database } from '../../lib/database.types';
import type { Clinic } from '../../hooks/useMyClinic';

type Doctor = Database['public']['Tables']['doctors']['Row'];
type OutletCtx = { clinic: Clinic | null };

export default function DoctorsPage() {
  const { clinic } = useOutletContext<OutletCtx>();
  const [list, setList] = useState<Doctor[]>([]);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!clinic) return;
    setLoading(true);
    const { data } = await supabase
      .from('doctors')
      .select('*')
      .eq('clinic_id', clinic.id)
      .order('created_at', { ascending: false });
    setList(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [clinic?.id]);

  if (!clinic) return <EmptyClinicHint />;

  async function remove(id: string) {
    if (!confirm('Удалить врача?')) return;
    await supabase.from('doctors').delete().eq('id', id);
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Врачи</h1>
        <Button size="sm" onClick={() => setEditing({ clinic_id: clinic.id, full_name: '', specialty: '', is_active: true } as Doctor)}>
          Добавить врача
        </Button>
      </div>

      {editing && (
        <DoctorForm doctor={editing} clinicId={clinic.id} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void load(); }} />
      )}

      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {loading ? (
          <div className="p-4 text-sm text-stone-500">Загрузка…</div>
        ) : list.length === 0 ? (
          <div className="p-6 text-sm text-stone-500 text-center">Врачей пока нет</div>
        ) : (
          list.map((d) => (
            <div key={d.id} className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 overflow-hidden flex items-center justify-center">
                {d.photo_url ? <img src={d.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-stone-400 text-xs">нет</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-stone-800">{d.full_name}</div>
                <div className="text-sm text-stone-500">
                  {d.specialty}
                  {d.experience_years ? ` · ${d.experience_years} лет опыта` : ''}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(d)} className="text-sm text-primary hover:underline">Изменить</button>
                <button onClick={() => remove(d.id)} className="text-sm text-red-600 hover:underline">Удалить</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DoctorForm({ doctor, clinicId, onClose, onSaved }: { doctor: Doctor; clinicId: string; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState(doctor);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const path = `${clinicId}/${sanitizeFileName(file.name)}`;
      const { publicUrl } = await uploadFile('doctor-photos', path, file);
      setD({ ...d, photo_url: publicUrl ?? null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    const payload = {
      clinic_id: clinicId,
      full_name: d.full_name,
      specialty: d.specialty,
      photo_url: d.photo_url,
      bio: d.bio,
      experience_years: d.experience_years,
      education: d.education,
      price_from: d.price_from,
      currency: d.currency ?? 'RUB',
      is_active: d.is_active ?? true,
    };
    const res = d.id
      ? await supabase.from('doctors').update(payload).eq('id', d.id)
      : await supabase.from('doctors').insert(payload);
    setSaving(false);
    if (res.error) setError(res.error.message);
    else onSaved();
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 overflow-hidden flex items-center justify-center">
          {d.photo_url ? <img src={d.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-stone-400 text-xs">нет</span>}
        </div>
        <input type="file" accept="image/*" onChange={onPhoto} />
      </div>
      <Input label="ФИО" value={d.full_name} onChange={(e) => setD({ ...d, full_name: e.target.value })} required />
      <Input label="Специальность" value={d.specialty} onChange={(e) => setD({ ...d, specialty: e.target.value })} required />
      <div className="grid md:grid-cols-2 gap-4">
        <Input type="number" label="Опыт (лет)" value={d.experience_years ?? ''} onChange={(e) => setD({ ...d, experience_years: e.target.value ? Number(e.target.value) : null })} />
        <Input type="number" label="Цена от" value={d.price_from ?? ''} onChange={(e) => setD({ ...d, price_from: e.target.value ? Number(e.target.value) : null })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Образование</label>
        <textarea value={d.education ?? ''} onChange={(e) => setD({ ...d, education: e.target.value })} rows={2} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">О враче</label>
        <textarea value={d.bio ?? ''} onChange={(e) => setD({ ...d, bio: e.target.value })} rows={3} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Сохраняем…' : 'Сохранить'}</Button>
        <Button size="sm" variant="outline" onClick={onClose}>Отмена</Button>
      </div>
    </div>
  );
}
