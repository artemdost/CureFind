import { Link } from 'react-router-dom';
import { clinics, regions, specialties } from '../data/clinics';
import SearchBar from '../components/SearchBar';
import ClinicCard from '../components/ClinicCard';
import MapView from '../components/MapView';

const stats = [
  { value: '19', label: 'клиник' },
  { value: '46', label: 'врачей' },
  { value: '6', label: 'городов' },
  { value: 'до 60%', label: 'экономия' },
];

export default function HomePage() {
  const topClinics = clinics
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="bg-warm pt-14 pb-16 sm:pt-20 sm:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-800 leading-tight mb-4">
              Найдите своего врача<br />
              <span className="text-primary">в регионах России</span>
            </h1>
            <p className="text-base sm:text-lg text-stone-500 leading-relaxed">
              Сравнивайте клиники, цены и отзывы. Запись онлайн в&nbsp;лучшие
              медицинские центры Саранска, Нижнего Новгорода, Пензы и&nbsp;Казани.
            </p>
          </div>

          <div className="max-w-3xl">
            <SearchBar />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 sm:gap-10 mt-10">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-2xl sm:text-3xl font-bold text-stone-800">{s.value}</p>
                <p className="text-sm text-stone-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top clinics */}
      <section className="py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-800">
                Лучшие клиники
              </h2>
              <p className="text-sm text-stone-400 mt-1">По рейтингу и отзывам пациентов</p>
            </div>
            <Link
              to="/search"
              className="hidden sm:inline text-sm text-primary font-medium hover:underline"
            >
              Все клиники &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topClinics.map(clinic => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>

          <div className="text-center mt-6 sm:hidden">
            <Link to="/search" className="text-sm text-primary font-medium">
              Смотреть все клиники &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Map section */}
      <section className="pb-14 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">
            Клиники на карте
          </h2>
          <p className="text-sm text-stone-400 mb-6">
            Нажмите на маркер, чтобы узнать подробности
          </p>
          <MapView clinics={clinics} height="420px" />
        </div>
      </section>

      {/* Regions */}
      <section className="bg-warm py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">
            Города
          </h2>
          <p className="text-sm text-stone-400 mb-8">Выберите город, чтобы увидеть доступные клиники</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {regions.map(r => {
              const count = clinics.filter(c => c.regionId === r.id).length;
              return (
                <Link
                  key={r.id}
                  to={`/search?region=${r.id}`}
                  className="bg-white rounded-xl border border-stone-200 p-5 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <h3 className="font-semibold text-stone-800 group-hover:text-primary transition-colors">
                    {r.name}
                  </h3>
                  <p className="text-sm text-stone-400 mt-1">
                    {count} {count === 1 ? 'клиника' : count < 5 ? 'клиники' : 'клиник'}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">
            Направления
          </h2>
          <p className="text-sm text-stone-400 mb-8">Найдите специалиста в нужной области</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {specialties.slice(0, 6).map(s => {
              const icons: Record<string, string> = {
                'Стоматология': '🦷', 'Гинекология': '👩‍⚕️', 'Флебология': '🩸',
                'Терапия': '💊', 'Кардиология': '🏥', 'Урология': '🔬',
              };
              return (
                <Link
                  key={s}
                  to={`/search?specialty=${encodeURIComponent(s)}`}
                  className="bg-white rounded-xl border border-stone-200 p-4 text-center hover:border-primary/30 hover:shadow-sm transition-all group"
                >
                  <span className="text-2xl block mb-2">{icons[s] || '💊'}</span>
                  <span className="text-sm font-medium text-stone-700 group-hover:text-primary transition-colors">
                    {s}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-stone-800 text-white py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-center">
            Как это работает
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Выберите', text: 'Ищите клиники по городу и направлению. Сравнивайте цены, читайте отзывы реальных пациентов.' },
              { n: '02', title: 'Запишитесь', text: 'Оставьте заявку онлайн или позвоните. Мы перезвоним в течение 15 минут и подберём удобное время.' },
              { n: '03', title: 'Лечитесь', text: 'Приезжайте в клинику. При необходимости поможем с логистикой — билеты, жильё, трансфер.' },
            ].map(step => (
              <div key={step.n}>
                <span className="text-3xl font-bold text-primary/60">{step.n}</span>
                <h3 className="text-xl font-semibold mt-2 mb-2">{step.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-3">
            Не знаете, с чего начать?
          </h2>
          <p className="text-stone-500 mb-6 max-w-lg mx-auto">
            Позвоните нам или оставьте заявку — подберём клинику и врача бесплатно
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/search"
              className="bg-primary hover:bg-primary-dark text-white font-medium px-8 py-3 rounded-xl transition-colors text-sm"
            >
              Найти клинику
            </Link>
            <a
              href="tel:+78001234567"
              className="border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium px-8 py-3 rounded-xl transition-colors text-sm"
            >
              8 (800) 123-45-67
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
