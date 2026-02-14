import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { services } from '../../data/services';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';

export default function Services() {
  const { t } = useTranslation();

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={t('services.title')} subtitle={t('services.subtitle')} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Link key={service.slug} to={`/services/${service.slug}`}>
              <Card className="h-full hover:scale-105 transition-transform cursor-pointer">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t(`${service.translationKey}.name`)}
                </h3>
                <p className="text-gray-600">
                  {t(`${service.translationKey}.shortDesc`)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
