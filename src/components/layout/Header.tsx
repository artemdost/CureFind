import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
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

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <span className="text-lg font-bold text-stone-800">
              Cure<span className="text-primary">Find</span>
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
            <a href="tel:+78001234567" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
              8 (800) 123-45-67
            </a>
            <Link
              to="/search"
              className="bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Найти врача
            </Link>
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
                  isActive(link.to)
                    ? 'text-primary font-medium'
                    : 'text-stone-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-stone-100">
              <a href="tel:+78001234567" className="block py-2 px-2 text-sm text-stone-500">
                8 (800) 123-45-67
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
