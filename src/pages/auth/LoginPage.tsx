import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const captchaRef = useRef<HCaptcha>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!captchaToken) {
      setError('Пройдите капчу');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });
    setLoading(false);

    captchaRef.current?.resetCaptcha();
    setCaptchaToken(null);

    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Неверный email или пароль' : error.message);
      return;
    }
    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-stone-800 mb-2">Вход</h1>
      <p className="text-sm text-stone-500 mb-6">Войдите, чтобы управлять своей клиникой или оставлять отзывы.</p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-stone-200 p-6">
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
          autoComplete="current-password"
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

        <Button type="submit" size="md" className="w-full" disabled={loading}>
          {loading ? 'Входим…' : 'Войти'}
        </Button>

        <div className="text-sm text-stone-500 text-center space-y-1">
          <div>
            Нет аккаунта?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </div>
          <div>
            Владелец клиники?{' '}
            <Link to="/register/clinic" className="text-primary hover:underline">
              Зарегистрировать клинику
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
