import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { uploadFile, deleteFile, sanitizeFileName } from '../../lib/storage';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import type { Clinic } from '../../hooks/useMyClinic';

type OutletCtx = { clinic: Clinic | null };

export default function ClinicProfilePage() {
  const { clinic: outletClinic } = useOutletContext<OutletCtx>();
  const [clinic, setClinic] = useState<Clinic | null>(outletClinic);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => setClinic(outletClinic), [outletClinic]);

  if (!clinic) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <p className="text-sm text-stone-500 mb-4">У вас ещё нет зарегистрированной клиники.</p>
        <Link to="/dashboard/clinic/new">
          <Button>Зарегистрировать клинику</Button>
        </Link>
      </div>
    );
  }

  async function save() {
    if (!clinic) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error: upErr } = await supabase
      .from('clinics')
      .update({
        name: clinic.name,
        description: clinic.description,
        city: clinic.city,
        region: clinic.region,
        address: clinic.address,
        phone: clinic.phone,
        email: clinic.email,
        website: clinic.website,
        specialties: clinic.specialties,
      })
      .eq('id', clinic.id);
    setSaving(false);
    if (upErr) setError(upErr.message);
    else setSaved(true);
  }

  async function uploadPhoto(file: File, bucket: 'clinic-logos' | 'clinic-photos' | 'clinic-covers') {
    if (!clinic) return null;
    const actualBucket = bucket === 'clinic-covers' ? 'clinic-photos' : bucket;
    const path = `${clinic.id}/${sanitizeFileName(file.name)}`;
    const { publicUrl } = await uploadFile(actualBucket, path, file);
    return { path, publicUrl };
  }

  async function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !clinic) return;
    setUploading(true);
    try {
      const res = await uploadPhoto(file, 'clinic-logos');
      if (res?.publicUrl) {
        await supabase.from('clinics').update({ logo_url: res.publicUrl }).eq('id', clinic.id);
        setClinic({ ...clinic, logo_url: res.publicUrl });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  }

  async function addGalleryPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !clinic) return;
    setUploading(true);
    try {
      const res = await uploadPhoto(file, 'clinic-photos');
      if (res?.publicUrl) {
        const newPhotos = [...clinic.photos, res.publicUrl];
        await supabase.from('clinics').update({ photos: newPhotos }).eq('id', clinic.id);
        setClinic({ ...clinic, photos: newPhotos });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  }

  async function removeGalleryPhoto(url: string) {
    if (!clinic) return;
    try {
      const m = url.match(/\/clinic-photos\/(.+)$/);
      if (m?.[1]) await deleteFile('clinic-photos', m[1]);
      const newPhotos = clinic.photos.filter((u) => u !== url);
      await supabase.from('clinics').update({ photos: newPhotos }).eq('id', clinic.id);
      setClinic({ ...clinic, photos: newPhotos });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <h1 className="text-xl font-bold text-stone-800 mb-4">Профиль клиники</h1>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-stone-100 overflow-hidden flex items-center justify-center">
            {clinic.logo_url ? (
              <img src={clinic.logo_url} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-stone-400 text-xs">Без логотипа</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Логотип</label>
            <input type="file" accept="image/*" onChange={onLogoChange} disabled={uploading} />
          </div>
        </div>

        <div className="space-y-4">
          <Input label="Название" value={clinic.name} onChange={(e) => setClinic({ ...clinic, name: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Описание</label>
            <textarea
              value={clinic.description ?? ''}
              onChange={(e) => setClinic({ ...clinic, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Город" value={clinic.city} onChange={(e) => setClinic({ ...clinic, city: e.target.value })} />
            <Input label="Регион" value={clinic.region ?? ''} onChange={(e) => setClinic({ ...clinic, region: e.target.value })} />
          </div>
          <Input label="Адрес" value={clinic.address} onChange={(e) => setClinic({ ...clinic, address: e.target.value })} />
          <div className="grid md:grid-cols-2 gap-4">
            <Input type="tel" label="Телефон" value={clinic.phone ?? ''} onChange={(e) => setClinic({ ...clinic, phone: e.target.value })} />
            <Input type="email" label="Email" value={clinic.email ?? ''} onChange={(e) => setClinic({ ...clinic, email: e.target.value })} />
          </div>
          <Input type="url" label="Сайт" value={clinic.website ?? ''} onChange={(e) => setClinic({ ...clinic, website: e.target.value })} />
          <Input
            label="Специализации (через запятую)"
            value={clinic.specialties.join(', ')}
            onChange={(e) => setClinic({ ...clinic, specialties: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          />
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        {saved && <p className="text-sm text-emerald-600 mt-3">Сохранено</p>}

        <div className="mt-5 flex gap-3">
          <Button onClick={save} disabled={saving}>{saving ? 'Сохраняем…' : 'Сохранить'}</Button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <h2 className="font-semibold text-stone-800 mb-4">Галерея фото</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {clinic.photos.map((url) => (
            <div key={url} className="relative group aspect-square bg-stone-100 rounded-lg overflow-hidden">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeGalleryPhoto(url)}
                className="absolute top-1 right-1 bg-white/90 text-red-600 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
              >
                Удалить
              </button>
            </div>
          ))}
          <label className="aspect-square border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center text-xs text-stone-500 cursor-pointer hover:border-primary hover:text-primary">
            <span className="text-2xl">+</span>
            <span>Добавить</span>
            <input type="file" accept="image/*" onChange={addGalleryPhoto} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}
