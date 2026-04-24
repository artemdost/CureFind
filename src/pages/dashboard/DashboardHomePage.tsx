import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Clinic } from '../../hooks/useMyClinic';

type OutletCtx = { clinic: Clinic | null };

export default function DashboardHomePage() {
  const { profile, user } = useAuth();
  const { clinic } = useOutletContext<OutletCtx>();

  const wantsClinic = (user?.user_metadata as { wants_clinic?: boolean } | null)?.wants_clinic === true;
  const roleLabel =
    profile?.role === 'admin'
      ? 'Администратор'
      : profile?.role === 'clinic_owner'
        ? 'Владелец клиники'
        : 'Пациент';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-stone-800 mb-1">
          Здравствуйте, {profile?.full_name || user?.email}
        </h1>
        <p className="text-sm text-stone-500">Роль: {roleLabel}</p>
      </header>

      {!clinic && (profile?.role === 'clinic_owner' || wantsClinic) && (
        <section className="bg-primary-light border border-primary/20 rounded-xl p-6">
          <h2 className="font-semibold text-stone-800 mb-2">Зарегистрируйте клинику</h2>
          <p className="text-sm text-stone-600 mb-4">
            Заполните данные и загрузите лицензию. После проверки администратором клиника
            появится на публичной карте.
          </p>
          <Link
            to="/dashboard/clinic/new"
            className="inline-flex items-center bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Заполнить данные
          </Link>
        </section>
      )}

      {clinic && (
        <section className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold text-stone-800">{clinic.name}</h2>
              <p className="text-sm text-stone-500">{clinic.city}, {clinic.address}</p>
            </div>
            {clinic.verification_status === 'pending' && (
              <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-1 rounded">
                На проверке
              </span>
            )}
            {clinic.verification_status === 'approved' && (
              <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                Одобрена
              </span>
            )}
            {clinic.verification_status === 'rejected' && (
              <span className="text-xs font-medium bg-red-50 text-red-700 px-2 py-1 rounded">
                Отклонена
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Stat label="Показы" value={clinic.impressions_count} />
            <Stat label="Клики" value={clinic.clicks_count} />
            <Stat label="Отзывы" value={clinic.review_count} />
            <Stat label="Рейтинг" value={Number(clinic.avg_rating).toFixed(2)} />
          </div>
          {clinic.verification_status === 'rejected' && clinic.verification_note && (
            <p className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded">
              Причина отказа: {clinic.verification_note}
            </p>
          )}
        </section>
      )}

      {profile?.role === 'admin' && (
        <section className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="font-semibold text-stone-800 mb-2">Админ-панель</h2>
          <div className="space-y-1 text-sm">
            <Link to="/dashboard/admin/clinics" className="block text-primary hover:underline">
              → Заявки на регистрацию клиник
            </Link>
            <Link to="/dashboard/admin/reviews" className="block text-primary hover:underline">
              → Отзывы на финальной модерации
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-stone-50 rounded-lg p-3">
      <div className="text-xs text-stone-500">{label}</div>
      <div className="text-lg font-semibold text-stone-800">{value}</div>
    </div>
  );
}
