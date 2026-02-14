import { Link } from 'react-router-dom';
import type { Clinic } from '../data/clinics';
import StarRating from './StarRating';

interface ClinicCardProps {
  clinic: Clinic;
}

export default function ClinicCard({ clinic }: ClinicCardProps) {
  const minPrice = Math.min(...clinic.services.map(s => s.price));

  return (
    <Link to={`/clinic/${clinic.id}`} className="block clinic-card">
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-lg font-semibold text-stone-800 leading-tight">
                {clinic.name}
              </h3>
              <p className="text-sm text-stone-500 mt-0.5">
                {clinic.region} &middot; {clinic.address}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1.5">
                <StarRating rating={clinic.rating} />
                <span className="text-sm font-semibold text-stone-700">{clinic.rating}</span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">{clinic.reviewCount} отзывов</p>
            </div>
          </div>

          <p className="text-sm text-stone-600 mb-3 line-clamp-2 leading-relaxed">
            {clinic.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {clinic.specialties.slice(0, 4).map(name => (
              <span key={name} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                {name}
              </span>
            ))}
            {clinic.specialties.length > 4 && (
              <span className="text-xs text-stone-400">+{clinic.specialties.length - 4}</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <div className="text-sm">
              <span className="text-stone-400">от </span>
              <span className="font-semibold text-stone-800">{minPrice.toLocaleString('ru-RU')} &#8381;</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-400">
              <span>{clinic.workHours.split(',')[0]}</span>
              <span className="text-primary font-medium text-sm">Подробнее &rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
