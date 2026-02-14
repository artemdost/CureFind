import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="bg-gradient-to-br from-sky-50 to-emerald-50 py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          {t('hero.title')}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          {t('hero.subtitle')}
        </p>
        <Link to="/contacts">
          <Button size="lg">{t('hero.cta')}</Button>
        </Link>
      </div>
    </section>
  );
}
