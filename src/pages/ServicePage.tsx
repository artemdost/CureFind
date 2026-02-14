import { useParams, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { services } from '../data/services';
import Button from '../components/ui/Button';

export default function ServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const service = services.find((s) => s.slug === slug);
  if (!service) return <Navigate to="/" replace />;

  const procedures = t(`${service.translationKey}.procedures`, { returnObjects: true }) as string[];
  const advantages = t(`${service.translationKey}.advantages`, { returnObjects: true }) as string[];

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{service.icon}</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t(`${service.translationKey}.name`)}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t(`${service.translationKey}.description`)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('services.title') === 'Наши направления' ? 'Процедуры' : 'Procedures'}
            </h2>
            <ul className="space-y-3">
              {procedures.map((proc, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-gray-700">{proc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('benefits.title') === 'Почему CureFind' ? 'Преимущества' : 'Advantages'}
            </h2>
            <ul className="space-y-3">
              {advantages.map((adv, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-secondary">✓</span>
                  <span className="text-gray-700">{adv}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Other services */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            {t('services.title') === 'Наши направления' ? 'Другие направления' : 'Other services'}
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {services
              .filter((s) => s.slug !== slug)
              .map((s) => (
                <Link
                  key={s.slug}
                  to={`/services/${s.slug}`}
                  className="px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-700 font-medium"
                >
                  {s.icon} {t(`${s.translationKey}.name`)}
                </Link>
              ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/contacts">
            <Button size="lg">{t('hero.cta')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
