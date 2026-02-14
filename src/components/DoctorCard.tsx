import type { Doctor } from '../data/clinics';
import StarRating from './StarRating';

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const initials = doctor.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('');

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <div className="flex gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-semibold shrink-0"
          style={{ backgroundColor: doctor.color }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-stone-800 text-base leading-tight">
            {doctor.name}
          </h4>
          <p className="text-sm text-primary mt-0.5">{doctor.specialty}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1">
              <StarRating rating={doctor.rating} />
              <span className="text-xs font-medium text-stone-600">{doctor.rating}</span>
            </div>
            <span className="text-xs text-stone-400">
              Стаж {doctor.experience} лет
            </span>
          </div>
        </div>
      </div>
      <p className="text-sm text-stone-500 mt-3 leading-relaxed">
        {doctor.about}
      </p>
    </div>
  );
}
