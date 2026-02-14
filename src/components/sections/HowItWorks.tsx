import { useTranslation } from 'react-i18next';
import SectionTitle from '../ui/SectionTitle';

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = t('howItWorks.steps', { returnObjects: true }) as {
    title: string;
    description: string;
  }[];

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={t('howItWorks.title')} subtitle={t('howItWorks.subtitle')} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
