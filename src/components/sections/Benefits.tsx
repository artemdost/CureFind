import { useTranslation } from 'react-i18next';
import SectionTitle from '../ui/SectionTitle';

const icons = ['💰', '✅', '🤝'];

export default function Benefits() {
  const { t } = useTranslation();

  const items = t('benefits.items', { returnObjects: true }) as {
    title: string;
    description: string;
  }[];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={t('benefits.title')} subtitle={t('benefits.subtitle')} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl mb-4">{icons[index]}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
