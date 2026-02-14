import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import SectionTitle from '../ui/SectionTitle';

export default function ContactForm() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-sky-50 to-emerald-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={t('contactForm.title')} subtitle={t('contactForm.subtitle')} />

        {submitted ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-lg text-gray-700">{t('contactForm.success')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('contactForm.name')}
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('contactForm.phone')}
              </label>
              <input
                type="tel"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('contactForm.email')}
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('contactForm.message')}
              </label>
              <textarea
                rows={4}
                placeholder={t('contactForm.messagePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors resize-none"
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              {t('contactForm.submit')}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
