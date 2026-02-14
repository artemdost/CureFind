import { useTranslation } from 'react-i18next';
import { regions } from '../../data/regions';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';

export default function Regions() {
  const { t } = useTranslation();

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={t('regions.title')} subtitle={t('regions.subtitle')} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {regions.map((region) => (
            <Card key={region.translationKey}>
              <div className="text-4xl mb-3">{region.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t(`${region.translationKey}.name`)}
              </h3>
              <p className="text-sm text-gray-600">
                {t(`${region.translationKey}.description`)}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
