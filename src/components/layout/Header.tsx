import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, profile, signOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Главная' },
    { to: '/search', label: 'Найти клинику' },
    { to: '/about', label: 'О сервисе' },
    { to: '/contacts', label: 'Контакты' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  async function handleLogout() {
    await signOut();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
                <path d="M14.5 9.5L12 12l-2.5 2.5L12 12l2.5-2.5z" fill="currentColor" stroke="none" />
                <path d="M9.5 14.5L12 12l2.5 2.5L12 12l-2.5 2.5z" fill="currentColor" fillOpacity="0.55" stroke="none" />
              </svg>
            </div>
            <span className="text-lg font-bold text-stone-800">
              Мед<span className="text-primary">Компас</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isActive(link.to)
                    ? 'text-primary bg-primary-light/60 font-medium'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {!loading && session ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-md hover:bg-stone-100"
                >
                  Кабинет
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-stone-500 hover:text-stone-800"
                  title={profile?.full_name ?? undefined}
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-stone-600 hover:text-stone-900 px-3 py-1.5">
                  Войти
                </Link>
                <Link
                  to="/register/clinic"
                  className="bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Добавить клинику
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900"
            aria-label="Меню"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden py-3 border-t border-stone-100">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block py-2 px-2 text-sm rounded-md ${
                  isActive(link.to) ? 'text-primary font-medium' : 'text-stone-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-stone-100 space-y-1">
              {session ? (
                <>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 px-2 text-sm text-stone-700">
                    Кабинет
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left py-2 px-2 text-sm text-stone-500">
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 px-2 text-sm text-stone-700">
                    Войти
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="block py-2 px-2 text-sm text-stone-700">
                    Регистрация пациента
                  </Link>
                  <Link to="/register/clinic" onClick={() => setMenuOpen(false)} className="block py-2 px-2 text-sm text-primary font-medium">
                    Добавить клинику
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
