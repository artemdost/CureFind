import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M14.5 9.5L12 12l-2.5 2.5L12 12l2.5-2.5z" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <span className="text-base font-bold text-white">МедКомпас</span>
            </div>
            <p className="text-sm leading-relaxed">
              Агрегатор медицинских услуг в регионах России. Сравнивайте цены, выбирайте врачей, записывайтесь онлайн.
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Регионы</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link to="/search?region=moscow" className="hover:text-white transition-colors">Москва</Link></li>
              <li><Link to="/search?region=spb" className="hover:text-white transition-colors">Санкт-Петербург</Link></li>
              <li><Link to="/search?region=kazan" className="hover:text-white transition-colors">Казань</Link></li>
              <li><Link to="/search?region=nnov" className="hover:text-white transition-colors">Нижний Новгород</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Услуги</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link to={`/search?specialty=${encodeURIComponent('Стоматология')}`} className="hover:text-white transition-colors">Стоматология</Link></li>
              <li><Link to={`/search?specialty=${encodeURIComponent('Гинекология')}`} className="hover:text-white transition-colors">Гинекология</Link></li>
              <li><Link to={`/search?specialty=${encodeURIComponent('Флебология')}`} className="hover:text-white transition-colors">Флебология</Link></li>
              <li><Link to={`/search?specialty=${encodeURIComponent('Терапия')}`} className="hover:text-white transition-colors">Терапия</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Контакты</h4>
            <ul className="space-y-1.5 text-sm">
              <li>
                <a href="mailto:curefind@mail.ru" className="hover:text-white transition-colors">
                  curefind@mail.ru
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-stone-500">
          <p>&copy; 2024–{new Date().getFullYear()} МедКомпас</p>
          <p>Информация носит ознакомительный характер и не является публичной офертой</p>
        </div>
      </div>
    </footer>
  );
}
