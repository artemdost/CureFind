import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { getSignedUrl } from '../../../lib/storage';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import type { Database } from '../../../lib/database.types';

type Clinic = Database['public']['Tables']['clinics']['Row'] & {
  owner?: { full_name: string | null } | null;
};

export default function AdminClinicsPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [licenseUrls, setLicenseUrls] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    let q = supabase
      .from('clinics')
      .select('*, owner:profiles!clinics_owner_id_fkey(full_name)')
      .order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('verification_status', filter);
    const { data } = await q;
    setList((data as Clinic[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, [filter]);

  async function viewLicense(c: Clinic) {
    if (!c.license_document_url || licenseUrls[c.id]) return;
    try {
      const url = await getSignedUrl('clinic-licenses', c.license_document_url, 3600);
      setLicenseUrls({ ...licenseUrls, [c.id]: url });
      window.open(url, '_blank');
    } catch (e) {
      console.error(e);
    }
  }

  async function approve(c: Clinic) {
    await supabase
      .from('clinics')
      .update({
        verification_status: 'approved',
        verified_at: new Date().toISOString(),
        verified_by: user?.id ?? null,
        verification_note: null,
      })
      .eq('id', c.id);

    if (user) {
      await supabase.from('moderation_logs').insert({
        moderator_id: user.id,
        target_type: 'clinic',
        target_id: c.id,
        action: 'approve',
      });
    }
    await load();
  }

  async function reject(c: Clinic) {
    const note = prompt('Причина отклонения:');
    if (!note) return;
    await supabase
      .from('clinics')
      .update({
        verification_status: 'rejected',
        verified_at: new Date().toISOString(),
        verified_by: user?.id ?? null,
        verification_note: note,
      })
      .eq('id', c.id);

    if (user) {
      await supabase.from('moderation_logs').insert({
        moderator_id: user.id,
        target_type: 'clinic',
        target_id: c.id,
        action: 'reject',
        note,
      });
    }
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Клиники — модерация</h1>
        <div className="flex gap-1 bg-stone-100 rounded-lg p-1 text-sm">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded ${filter === f ? 'bg-white' : ''}`}>
              {f === 'pending' ? 'На проверке' : f === 'approved' ? 'Одобрены' : f === 'rejected' ? 'Отклонены' : 'Все'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-stone-200 rounded-xl p-6 text-sm text-stone-500">Загрузка…</div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-6 text-center text-sm text-stone-500">Заявок нет</div>
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <div key={c.id} className="bg-white border border-stone-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-800">{c.name}</h3>
                  <p className="text-sm text-stone-500">{c.city}, {c.address}</p>
                  <p className="text-xs text-stone-500 mt-1">
                    Владелец: {c.owner?.full_name ?? '—'} · ИНН: {c.inn ?? '—'} · Лицензия: {c.license_number ?? '—'}
                  </p>
                </div>
                <StatusBadge status={c.verification_status} />
              </div>

              {c.description && <p className="mt-3 text-sm text-stone-700">{c.description}</p>}

              <div className="mt-3 flex flex-wrap gap-2">
                {c.license_document_url && (
                  <Button size="sm" variant="outline" onClick={() => viewLicense(c)}>Открыть лицензию</Button>
                )}
                {c.verification_status === 'pending' && (
                  <>
                    <Button size="sm" onClick={() => approve(c)}>Одобрить</Button>
                    <Button size="sm" variant="outline" onClick={() => reject(c)}>Отклонить</Button>
                  </>
                )}
              </div>

              {c.verification_status === 'rejected' && c.verification_note && (
                <p className="mt-3 text-xs text-red-700 bg-red-50 p-2 rounded">Причина: {c.verification_note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'На проверке', cls: 'bg-amber-50 text-amber-700' },
    approved: { label: 'Одобрена', cls: 'bg-emerald-50 text-emerald-700' },
    rejected: { label: 'Отклонена', cls: 'bg-red-50 text-red-700' },
  };
  const m = map[status] ?? { label: status, cls: 'bg-stone-100 text-stone-600' };
  return <span className={`text-xs font-medium px-2 py-1 rounded ${m.cls}`}>{m.label}</span>;
}
