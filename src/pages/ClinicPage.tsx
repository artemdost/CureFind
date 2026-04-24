import { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { trackEvent } from '../lib/api';
import { useClinic } from '../hooks/useClinics';
import { formatOpeningHours } from '../lib/openingHours';
import StarRating from '../components/ui/StarRating';
import ClinicMapView from '../components/ClinicMapView';

export default function ClinicPage() {
  const { id } = useParams<{ id: string }>();
  const { clinic, loading } = useClinic(id);

  useEffect(() => {
    if (clinic) void trackEvent({ eventType: 'click', clinicId: clinic.id });
  }, [clinic?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-text-secondary">
        Загрузка клиники…
      </div>
    );
  }
  if (!clinic) return <Navigate to="/search" replace />;

  const servicesByCategory: Record<string, typeof clinic.services> = {};
  clinic.services.forEach(s => {
    if (!servicesByCategory[s.category]) servicesByCategory[s.category] = [];
    servicesByCategory[s.category].push(s);
  });

  return (
    <div className="min-h-screen bg-bg">
      {/* Breadcrumbs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
            <span>/</span>
            <Link to="/search" className="hover:text-primary transition-colors">Поиск</Link>
            <span>/</span>
            <Link to={`/search?region=${clinic.regionId}`} className="hover:text-primary transition-colors">{clinic.region}</Link>
            <span>/</span>
            <span className="text-text font-medium truncate">{clinic.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Clinic header */}
        <div className="bg-card rounded-xl border border-border p-6 sm:p-8 mb-6 fade-in">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-text">{clinic.name}</h1>
                {clinic.verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-verified bg-emerald-50 px-2 py-1 rounded-md">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Проверено МедКомпас
                  </span>
                )}
              </div>
              <p className="text-text-secondary">{clinic.region}, {clinic.address}</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="text-center">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={clinic.rating} size={18} />
                  <span className="text-xl font-bold text-text">{clinic.rating}</span>
                </div>
                <p className="text-xs text-text-light mt-1">{clinic.reviewCount} отзывов</p>
              </div>
            </div>
          </div>

          <p className="text-text-secondary mb-5 leading-relaxed">{clinic.description}</p>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-bg rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" fill="none" stroke="#1e6f9f" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-text-light">Телефон</p>
                <p className="text-sm font-medium text-text">{clinic.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-bg rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" fill="none" stroke="#1e6f9f" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-text-light">Режим работы</p>
                <p className="text-sm font-medium text-text">
                  {formatOpeningHours(clinic.workHours) || 'Уточняйте'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-bg rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" fill="none" stroke="#1e6f9f" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-text-light">Работает с</p>
                <p className="text-sm font-medium text-text">{clinic.yearOpened} года</p>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-2 mt-5">
            {clinic.specialties.map(spec => (
              <Link
                key={spec}
                to={`/search?specialty=${encodeURIComponent(spec)}`}
                className="text-xs bg-primary-light text-primary-dark px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors"
              >
                {spec}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Doctors & Services */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doctors */}
            <div className="bg-card rounded-xl border border-border p-6 fade-in">
              <h2 className="text-xl font-bold text-text mb-5">
                Врачи клиники
                <span className="text-sm font-normal text-text-light ml-2">({clinic.doctors.length})</span>
              </h2>
              <div className="space-y-4">
                {clinic.doctors.map(doctor => (
                  <div key={doctor.id} className="flex gap-4 p-4 bg-bg rounded-xl">
                    {/* Avatar */}
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0"
                      style={{ backgroundColor: doctor.color }}
                    >
                      {doctor.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-text">{doctor.name}</h3>
                          <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-1">
                          <StarRating rating={doctor.rating} size={12} />
                          <span className="text-xs font-semibold">{doctor.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-text-secondary">
                        <span>Стаж {doctor.experience} лет</span>
                        <span>{doctor.reviewCount} отзывов</span>
                      </div>
                      <p className="text-sm text-text-secondary mt-2 line-clamp-2">{doctor.about}</p>
                      <p className="text-xs text-text-light mt-1.5">{doctor.education}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services & Prices */}
            <div className="bg-card rounded-xl border border-border p-6 fade-in">
              <h2 className="text-xl font-bold text-text mb-5">
                Услуги и цены
              </h2>
              <div className="space-y-6">
                {Object.entries(servicesByCategory).map(([category, services]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">{category}</h3>
                    <div className="space-y-0.5">
                      {services.map(service => (
                        <div key={service.id} className="flex items-center justify-between py-3 px-3 hover:bg-bg rounded-lg transition-colors">
                          <span className="text-sm text-text">{service.name}</span>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            {service.oldPrice && (
                              <span className="text-xs text-old-price line-through">
                                {service.oldPrice.toLocaleString('ru-RU')} &#8381;
                              </span>
                            )}
                            <span className={`text-sm font-semibold ${service.oldPrice ? 'text-secondary' : 'text-text'}`}>
                              {service.price.toLocaleString('ru-RU')} &#8381;
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Map & Contact */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-card rounded-xl border border-border overflow-hidden fade-in">
              <div className="h-[250px]">
                <ClinicMapView
                  clinics={[clinic]}
                  center={[clinic.lat, clinic.lng]}
                  zoom={15}
                  height="100%"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-text font-medium">{clinic.address}</p>
                <p className="text-xs text-text-secondary mt-1">{clinic.region}</p>
              </div>
            </div>

            {/* Contact card */}
            <div className="bg-card rounded-xl border border-border p-5 fade-in">
              <h3 className="font-semibold text-text mb-3">Записаться на приём</h3>
              <p className="text-sm text-text-secondary mb-4">Оставьте заявку и мы перезвоним в течение 15 минут</p>
              <input
                type="text"
                placeholder="Ваше имя"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm mb-2 outline-none search-input-big"
              />
              <input
                type="tel"
                placeholder="Телефон"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm mb-3 outline-none search-input-big"
              />
              <button className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                Записаться
              </button>
              <p className="text-xs text-text-light text-center mt-2">или позвоните: {clinic.phone}</p>
            </div>

            {/* Quick stats */}
            <div className="bg-card rounded-xl border border-border p-5 fade-in">
              <h3 className="font-semibold text-text mb-3">О клинике</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Рейтинг</span>
                  <span className="font-medium text-text">{clinic.rating} из 5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Отзывы</span>
                  <span className="font-medium text-text">{clinic.reviewCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Врачей</span>
                  <span className="font-medium text-text">{clinic.doctors.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Услуг</span>
                  <span className="font-medium text-text">{clinic.services.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Специализаций</span>
                  <span className="font-medium text-text">{clinic.specialties.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
