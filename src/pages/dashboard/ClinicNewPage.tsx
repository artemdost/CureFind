import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { uploadFile, sanitizeFileName } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import type { Clinic } from '../../hooks/useMyClinic';

type OutletCtx = { clinic: Clinic | null };

function slugify(input: string) {
  const translit: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return input
    .toLowerCase()
    .split('')
    .map((ch) => translit[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export default function ClinicNewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clinic: existing } = useOutletContext<OutletCtx>();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [inn, setInn] = useState('');
  const [legalName, setLegalName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (existing) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <h1 className="text-xl font-bold text-stone-800 mb-2">Клиника уже создана</h1>
        <p className="text-sm text-stone-500 mb-4">
          У вашего аккаунта уже зарегистрирована клиника «{existing.name}». Изменения — в разделе
          «Профиль клиники».
        </p>
        <Button onClick={() => navigate('/dashboard/clinic')}>Открыть профиль</Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) return setError('Не авторизованы');
    if (!licenseFile) return setError('Загрузите документ лицензии');

    setLoading(true);
    try {
      const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
      const specialtiesArray = specialties
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const { data: clinic, error: insertError } = await supabase
        .from('clinics')
        .insert({
          owner_id: user.id,
          name: name.trim(),
          slug,
          description: description.trim() || null,
          city: city.trim(),
          region: region.trim() || null,
          address: address.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          website: website.trim() || null,
          specialties: specialtiesArray,
          inn: inn.trim() || null,
          legal_name: legalName.trim() || null,
          license_number: licenseNumber.trim() || null,
        })
        .select()
        .single();

      if (insertError || !clinic) throw insertError ?? new Error('Не удалось создать клинику');

      const filename = sanitizeFileName(licenseFile.name);
      const path = `${clinic.id}/${filename}`;
      await uploadFile('clinic-licenses', path, licenseFile);

      const { error: updateError } = await supabase
        .from('clinics')
        .update({ license_document_url: path })
        .eq('id', clinic.id);
      if (updateError) throw updateError;

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки формы');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6">
      <h1 className="text-xl font-bold text-stone-800 mb-2">Регистрация клиники</h1>
      <p className="text-sm text-stone-500 mb-6">
        После отправки заявка отправится на проверку администратору. Клиника появится на карте
        только после одобрения.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Название клиники" value={name} onChange={(e) => setName(e.target.value)} required />

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Город" value={city} onChange={(e) => setCity(e.target.value)} required />
          <Input label="Регион" value={region} onChange={(e) => setRegion(e.target.value)} />
        </div>
        <Input label="Адрес" value={address} onChange={(e) => setAddress(e.target.value)} required />

        <div className="grid md:grid-cols-2 gap-4">
          <Input type="tel" label="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Input type="url" label="Сайт" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />

        <Input
          label="Специализации"
          value={specialties}
          onChange={(e) => setSpecialties(e.target.value)}
          hint="Через запятую: стоматология, косметология, педиатрия"
        />

        <fieldset className="border border-stone-200 rounded-lg p-4 space-y-4">
          <legend className="text-sm font-medium text-stone-700 px-2">Юридическая информация</legend>
          <Input label="Юридическое название" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="ИНН"
              value={inn}
              onChange={(e) => setInn(e.target.value)}
              pattern="[0-9]{10,12}"
              hint="10 или 12 цифр"
            />
            <Input label="Номер лицензии" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Документ лицензии (PDF / JPG / PNG)
            </label>
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png"
              onChange={(e) => setLicenseFile(e.target.files?.[0] ?? null)}
              required
              className="block w-full text-sm text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-light file:text-primary hover:file:bg-primary-light/80"
            />
            <p className="mt-1 text-xs text-stone-500">Документ виден только вам и администратору.</p>
          </div>
        </fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Отправляем…' : 'Отправить на проверку'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}
