import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

export default function RegisterClinicPage() {
  const navigate = useNavigate();
  const captchaRef = useRef<HCaptcha>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) return setError('Пароль должен содержать минимум 8 символов');
    if (password !== passwordConfirm) return setError('Пароли не совпадают');
    if (!captchaToken) return setError('Пройдите капчу');

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken,
        data: { full_name: fullName, wants_clinic: true },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    setLoading(false);

    captchaRef.current?.resetCaptcha();
    setCaptchaToken(null);

    if (error) return setError(error.message);
    setDone(true);
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-stone-800 mb-3">Письмо отправлено</h1>
        <p className="text-stone-600 mb-2">
          Мы отправили ссылку-подтверждение на <strong>{email}</strong>.
        </p>
        <p className="text-stone-500 text-sm mb-6">
          После подтверждения email войдите в кабинет — там вы сможете заполнить данные клиники
          и загрузить лицензию. Клиника появится на карте после проверки администратором.
        </p>
        <Button onClick={() => navigate('/login')}>К форме входа</Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-stone-800 mb-2">Регистрация клиники</h1>
      <p className="text-sm text-stone-500 mb-6">
        Сначала создайте аккаунт представителя. После подтверждения email в личном кабинете
        заполните данные клиники и загрузите лицензию.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-stone-200 p-6">
        <Input label="ФИО представителя" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          label="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          hint="Минимум 8 символов"
        />
        <Input
          type="password"
          label="Повторите пароль"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />

        <div className="flex justify-center">
          <HCaptcha
            ref={captchaRef}
            sitekey={HCAPTCHA_SITE_KEY}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Создаём…' : 'Зарегистрироваться'}
        </Button>

        <p className="text-sm text-stone-500 text-center">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Войти
          </Link>
        </p>
      </form>
    </div>
  );
}
