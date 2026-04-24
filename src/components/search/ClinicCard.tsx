import { Link } from 'react-router-dom';
import type { Clinic } from '../../data/clinics';
import StarRating from '../ui/StarRating';
import { formatOpeningHours } from '../../lib/openingHours';

interface ClinicCardProps {
  clinic: Clinic;
}

export default function ClinicCard({ clinic }: ClinicCardProps) {
  const minPrice = clinic.services.length ? Math.min(...clinic.services.map((s) => s.price)) : 0;
  const hoursShort = formatOpeningHours(clinic.workHours).split(',')[0];

  return (
    <Link to={`/clinic/${clinic.id}`} className="block">
      <div className="bg-card border border-border rounded-xl p-5 card-hover fade-in">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-text truncate">{clinic.name}</h3>
              {clinic.verified && (
                <span className="flex-shrink-0 inline-flex items-center gap-0.5 text-xs font-medium text-verified bg-emerald-50 px-1.5 py-0.5 rounded">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  проверено
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary">{clinic.region}, {clinic.address}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-1">
              <StarRating rating={clinic.rating} />
              <span className="text-sm font-semibold text-text">{clinic.rating}</span>
            </div>
            <p className="text-xs text-text-light mt-0.5">{clinic.reviewCount} отзывов</p>
          </div>
        </div>

        <p className="text-sm text-text-secondary line-clamp-2 mb-3">{clinic.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {clinic.specialties.slice(0, 4).map(spec => (
            <span key={spec} className="text-xs bg-primary-light text-primary-dark px-2 py-0.5 rounded-full">
              {spec}
            </span>
          ))}
          {clinic.specialties.length > 4 && (
            <span className="text-xs text-text-light px-1">+{clinic.specialties.length - 4}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {clinic.doctors.length} врачей
            </span>
            <span className="flex items-center gap-1">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {hoursShort || '—'}
            </span>
          </div>
          <div className="text-right">
            {minPrice > 0 ? (
              <>
                <span className="text-xs text-text-light">от </span>
                <span className="text-sm font-semibold text-primary">{minPrice.toLocaleString('ru-RU')} &#8381;</span>
              </>
            ) : (
              <span className="text-xs text-text-light">По запросу</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
