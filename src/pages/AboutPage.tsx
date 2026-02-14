import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="bg-warm min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-stone-800 mb-8">О сервисе CureFind</h1>

        <div className="space-y-8 text-stone-600 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-3">Что такое CureFind?</h2>
            <p>
              CureFind — это агрегатор медицинских услуг в регионах России.
              Мы собрали лучшие клиники Саранска, Нижнего Новгорода, Пензы и Казани
              в одном месте, чтобы вы могли сравнить цены, почитать отзывы и выбрать
              подходящего врача, не выходя из дома.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-3">Зачем ехать в регион?</h2>
            <p className="mb-3">
              Региональные клиники часто оснащены тем же оборудованием, что и столичные.
              Врачи имеют высокую квалификацию и многолетний опыт. А вот цены — в среднем
              на 40–60% ниже, чем в Москве или Санкт-Петербурге.
            </p>
            <p>
              Например, установка импланта Osstem в Москве стоит от 35 000 руб.,
              а в Саранске — от 18 000 руб. Коронка из циркония: 30 000 руб. vs 14 000 руб.
              При этом материалы и технологии одинаковые.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-3">Как мы отбираем клиники</h2>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="text-primary shrink-0 mt-0.5">1.</span>
                <span>Проверяем лицензии и сертификаты</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0 mt-0.5">2.</span>
                <span>Оцениваем оборудование и условия</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0 mt-0.5">3.</span>
                <span>Собираем реальные отзывы пациентов</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0 mt-0.5">4.</span>
                <span>Следим за квалификацией врачей</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-3">Для кого этот сервис</h2>
            <p>
              Для всех, кто хочет получить качественную медицинскую помощь и при этом
              сэкономить. Жители Москвы, Петербурга и других крупных городов приезжают в
              регионы на стоматологию, гинекологию, флебологию и другие направления.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-200">
          <Link
            to="/search"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Найти клинику
          </Link>
        </div>
      </div>
    </div>
  );
}
