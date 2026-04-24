import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMyClinic } from '../../hooks/useMyClinic';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

export default function DashboardLayout() {
  const { profile } = useAuth();
  const { clinic, loading: clinicLoading } = useMyClinic();

  const role = profile?.role ?? 'client';
  const hasClinic = !!clinic;

  const items: NavItem[] = [{ to: '/dashboard', label: 'Главная', end: true }];

  if (role === 'clinic_owner' || (role === 'client' && hasClinic)) {
    items.push(
      { to: '/dashboard/clinic', label: 'Профиль клиники' },
      { to: '/dashboard/doctors', label: 'Врачи' },
      { to: '/dashboard/services', label: 'Услуги' },
      { to: '/dashboard/products', label: 'Товары' },
      { to: '/dashboard/posts', label: 'Посты' },
      { to: '/dashboard/promotions', label: 'Акции' },
      { to: '/dashboard/reviews', label: 'Отзывы' },
      { to: '/dashboard/calls', label: 'Звонки' },
      { to: '/dashboard/analytics', label: 'Статистика' },
    );
  }

  if (role === 'admin') {
    items.push(
      { to: '/dashboard/admin/clinics', label: 'Клиники (админ)' },
      { to: '/dashboard/admin/reviews', label: 'Отзывы (админ)' },
      { to: '/dashboard/admin/users', label: 'Пользователи' },
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        <aside className="md:sticky md:top-20 md:self-start">
          <nav className="bg-white rounded-xl border border-stone-200 p-2 flex md:flex-col overflow-x-auto md:overflow-visible">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-primary-light text-primary font-medium'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {clinic && (
            <div className="mt-3 hidden md:block text-xs text-stone-500 px-3">
              Клиника: <span className="text-stone-700">{clinic.name}</span>
              {clinic.verification_status === 'pending' && (
                <div className="mt-1 text-amber-600">На проверке</div>
              )}
              {clinic.verification_status === 'rejected' && (
                <div className="mt-1 text-red-600">Отклонена</div>
              )}
              {clinic.verification_status === 'approved' && (
                <div className="mt-1 text-emerald-600">Одобрена</div>
              )}
            </div>
          )}
        </aside>

        <main>
          {clinicLoading ? (
            <div className="text-stone-500">Загрузка…</div>
          ) : (
            <Outlet context={{ clinic }} />
          )}
        </main>
      </div>
    </div>
  );
}
