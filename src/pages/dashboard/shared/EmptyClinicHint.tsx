import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

export default function EmptyClinicHint() {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6">
      <h2 className="font-semibold text-stone-800 mb-2">Сначала зарегистрируйте клинику</h2>
      <p className="text-sm text-stone-500 mb-4">
        Раздел станет доступен после заполнения формы клиники.
      </p>
      <Link to="/dashboard/clinic/new">
        <Button size="sm">Заполнить данные</Button>
      </Link>
    </div>
  );
}
