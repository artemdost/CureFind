import { useState, type FormEvent } from 'react';

export default function ContactsPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-warm min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-stone-800 mb-8">Контакты</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact info */}
          <div>
            <div className="space-y-5 mb-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-stone-400">Телефон</p>
                  <p className="font-medium text-stone-800">8 (800) 123-45-67</p>
                  <p className="text-xs text-stone-400 mt-0.5">Бесплатно по России</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-stone-400">Email</p>
                  <p className="font-medium text-stone-800">info@curefind.ru</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-stone-400">Время работы</p>
                  <p className="font-medium text-stone-800">Пн-Пт: 9:00 — 20:00</p>
                  <p className="text-sm text-stone-600">Сб: 10:00 — 16:00</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <p className="text-sm text-stone-500 leading-relaxed">
                Мы ответим на любые вопросы о клиниках, врачах, ценах
                и организации поездки. Консультация бесплатная, ни к чему не обязывает.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="text-xl font-semibold text-stone-800 mb-5">Оставить заявку</h2>

            {submitted ? (
              <div className="py-10 text-center">
                <div className="text-4xl mb-3">&#10003;</div>
                <p className="text-lg font-medium text-stone-800 mb-1">Заявка отправлена</p>
                <p className="text-sm text-stone-500">
                  Мы перезвоним в течение 30 минут в рабочее время
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Имя</label>
                  <input
                    type="text"
                    required
                    placeholder="Как вас зовут"
                    className="w-full bg-stone-50 border-0 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Телефон</label>
                  <input
                    type="tel"
                    required
                    placeholder="+7 (___) ___-__-__"
                    className="w-full bg-stone-50 border-0 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">
                    Что вас интересует
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Расскажите, какая помощь вам нужна..."
                    className="w-full bg-stone-50 border-0 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg text-sm transition-colors"
                >
                  Отправить заявку
                </button>
                <p className="text-xs text-stone-400 text-center">
                  Нажимая кнопку, вы соглашаетесь на обработку персональных данных
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
