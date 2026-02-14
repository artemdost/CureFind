import { useTranslation } from 'react-i18next';
import Packages from '../components/sections/Packages';
import ContactForm from '../components/sections/ContactForm';

export default function PackagesPage() {
  const { t } = useTranslation();

  return (
    <>
      <div className="bg-gradient-to-br from-sky-50 to-emerald-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('packages.title')}</h1>
          <p className="text-lg text-gray-600">{t('packages.subtitle')}</p>
        </div>
      </div>
      <Packages />
      <ContactForm />
    </>
  );
}
