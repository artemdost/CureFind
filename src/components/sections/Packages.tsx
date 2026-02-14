import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { packages } from '../../data/packages';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function Packages() {
  const { t } = useTranslation();

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={t('packages.title')} subtitle={t('packages.subtitle')} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => {
            const features = t(`${pkg.translationKey}.features`, { returnObjects: true }) as string[];
            return (
              <Card key={pkg.translationKey} highlighted={pkg.highlighted} className="flex flex-col">
                <h3 className={`text-2xl font-bold mb-1 ${pkg.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {t(`${pkg.translationKey}.name`)}
                </h3>
                <p className={`text-3xl font-bold mb-2 ${pkg.highlighted ? 'text-white' : 'text-primary'}`}>
                  {t(`${pkg.translationKey}.price`)}
                </p>
                <p className={`mb-4 ${pkg.highlighted ? 'text-sky-100' : 'text-gray-600'}`}>
                  {t(`${pkg.translationKey}.description`)}
                </p>
                <ul className="space-y-2 mb-6 flex-1">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className={pkg.highlighted ? 'text-sky-200' : 'text-secondary'}>✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contacts">
                  <Button
                    variant={pkg.highlighted ? 'outline' : 'primary'}
                    className={`w-full ${pkg.highlighted ? 'border-white text-white hover:bg-white hover:text-primary' : ''}`}
                  >
                    {t('packages.cta')}
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
