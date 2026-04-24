import { useEffect, useState } from 'react';
import { fetchClinicById, fetchClinics, fetchRegions } from '../lib/api';
import type { Clinic, Region } from '../data/clinics';

export function useClinics() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchClinics().then((data) => {
      if (!active) return;
      setClinics(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { clinics, loading };
}

export function useClinic(id: string | undefined) {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setClinic(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetchClinicById(id).then((data) => {
      if (!active) return;
      setClinic(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  return { clinic, loading };
}

export function useRegions() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchRegions().then((data) => {
      if (!active) return;
      setRegions(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { regions, loading };
}
