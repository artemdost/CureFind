import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SPECIALTIES, trackEvent } from '../lib/api';
import { useClinics, useRegions } from '../hooks/useClinics';
import { worksWeekends } from '../lib/openingHours';
import type { Clinic } from '../data/clinics';
import ClinicCard from '../components/search/ClinicCard';
import ClinicMapView from '../components/ClinicMapView';

function searchInClinics(list: Clinic[], query: string, regionId?: string, specialty?: string): Clinic[] {
  let results = [...list];
  if (regionId) results = results.filter((c) => c.regionId === regionId);
  if (specialty) results = results.filter((c) => c.specialties.includes(specialty));
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.specialties.some((s) => s.toLowerCase().includes(q)) ||
        c.doctors.some((d) => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q)) ||
        c.services.some((s) => s.name.toLowerCase().includes(q)),
    );
  }
  return results;
}

function clinicWorksWeekends(clinic: Clinic): boolean {
  return worksWeekends(clinic.workHours);
}

function clinicHasDiscounts(clinic: Clinic): boolean {
  return clinic.services.some(s => s.oldPrice !== undefined);
}

function clinicMinPrice(clinic: Clinic): number {
  if (!clinic.services.length) return 0;
  return Math.min(...clinic.services.map((s) => s.price));
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clinics: allClinics, loading } = useClinics();
  const { regions } = useRegions();
  const specialties = SPECIALTIES;

  const initialRegion = searchParams.get('region') || '';
  const initialSpecialty = searchParams.get('specialty') || '';
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'reviews'>('rating');
  const [showMap, setShowMap] = useState(true);

  // Advanced filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(0); // 0 = any
  const [minRating, setMinRating] = useState<number>(0); // 0 = any
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hasDiscounts, setHasDiscounts] = useState(false);
  const [worksWeekends, setWorksWeekends] = useState(false);

  const activeAdvancedCount = [
    maxPrice > 0,
    minRating > 0,
    verifiedOnly,
    hasDiscounts,
    worksWeekends,
  ].filter(Boolean).length;

  const resetAdvanced = () => {
    setMaxPrice(0);
    setMinRating(0);
    setVerifiedOnly(false);
    setHasDiscounts(false);
    setWorksWeekends(false);
  };

  const resetAll = () => {
    setQuery('');
    setSelectedRegion('');
    setSelectedSpecialty('');
    resetAdvanced();
  };

  const results = useMemo(() => {
    let found = searchInClinics(allClinics, query, selectedRegion || undefined, selectedSpecialty || undefined);

    if (maxPrice > 0) {
      found = found.filter(c => clinicMinPrice(c) <= maxPrice);
    }
    if (minRating > 0) {
      found = found.filter(c => c.rating >= minRating);
    }
    if (verifiedOnly) {
      found = found.filter(c => c.verified);
    }
    if (hasDiscounts) {
      found = found.filter(c => clinicHasDiscounts(c));
    }
    if (worksWeekends) {
      found = found.filter(c => clinicWorksWeekends(c));
    }

    return [...found].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
      if (sortBy === 'price') return clinicMinPrice(a) - clinicMinPrice(b);
      return 0;
    });
  }, [allClinics, query, selectedRegion, selectedSpecialty, sortBy, maxPrice, minRating, verifiedOnly, hasDiscounts, worksWeekends]);

  const mapCenter = useMemo(() => {
    if (selectedRegion) {
      const region = regions.find((r) => r.id === selectedRegion);
      if (region) return [region.lat, region.lng] as [number, number];
    }
    return undefined;
  }, [selectedRegion, regions]);

  const searchTrackedRef = useRef<string>('');
  useEffect(() => {
    const key = `${query}|${selectedRegion}|${selectedSpecialty}`;
    if (!query && !selectedRegion && !selectedSpecialty) return;
    if (searchTrackedRef.current === key) return;
    searchTrackedRef.current = key;
    const t = window.setTimeout(() => {
      void trackEvent({
        eventType: 'search',
        searchQuery: query || null,
        metadata: { region: selectedRegion || null, specialty: selectedSpecialty || null },
      });
    }, 800);
    return () => window.clearTimeout(t);
  }, [query, selectedRegion, selectedSpecialty]);

  const impressionTrackedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    results.slice(0, 20).forEach((c) => {
      if (impressionTrackedRef.current.has(c.id)) return;
      impressionTrackedRef.current.add(c.id);
      void trackEvent({ eventType: 'impression', clinicId: c.id });
    });
  }, [results]);

  const mapZoom = selectedRegion ? 11 : 5;

  const priceOptions = [
    { value: 0, label: 'Любая' },
    { value: 1000, label: 'до 1 000 \u20BD' },
    { value: 3000, label: 'до 3 000 \u20BD' },
    { value: 5000, label: 'до 5 000 \u20BD' },
    { value: 15000, label: 'до 15 000 \u20BD' },
  ];

  const ratingOptions = [
    { value: 0, label: 'Любой' },
    { value: 4.0, label: '4.0+' },
    { value: 4.5, label: '4.5+' },
    { value: 4.7, label: '4.7+' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Search header */}
      <div className="bg-card border-b border-border sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Врач, услуга или клиника..."
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm search-input-big outline-none bg-white"
              />
            </div>

            {/* Region filter */}
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="px-3 py-2.5 border border-border rounded-lg text-sm bg-white outline-none cursor-pointer min-w-[160px]"
            >
              <option value="">Все регионы</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            {/* Specialty filter */}
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="px-3 py-2.5 border border-border rounded-lg text-sm bg-white outline-none cursor-pointer min-w-[160px]"
            >
              <option value="">Все специальности</option>
              {specialties.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Sort and view controls */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5 text-sm flex-wrap">
              <span className="text-text-secondary">Найдено: <strong className="text-text">{results.length}</strong> клиник</span>
              <span className="text-border mx-2">|</span>
              <span className="text-text-secondary mr-1">Сортировка:</span>
              {([
                ['rating', 'По рейтингу'],
                ['reviews', 'По отзывам'],
                ['price', 'По цене'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    sortBy === key
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="text-border mx-2">|</span>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors inline-flex items-center gap-1 ${
                  showAdvanced || activeAdvancedCount > 0
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-gray-100'
                }`}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                Больше фильтров
                {activeAdvancedCount > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 inline-flex items-center justify-center">
                    {activeAdvancedCount}
                  </span>
                )}
              </button>
              {activeAdvancedCount > 0 && (
                <button
                  onClick={resetAdvanced}
                  className="px-2 py-1 rounded text-xs text-red-500 hover:bg-red-50 transition-colors"
                >
                  Сбросить все
                </button>
              )}
            </div>

            <button
              onClick={() => setShowMap(!showMap)}
              className="hidden lg:flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors flex-shrink-0"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
              {showMap ? 'Скрыть карту' : 'Показать карту'}
            </button>
          </div>

          {/* Advanced filters panel */}
          {showAdvanced && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                {/* Price range */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-text-secondary font-medium">Мин. цена услуг</span>
                  <select
                    value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="px-3 py-1.5 border border-border rounded-lg text-xs bg-white outline-none cursor-pointer"
                  >
                    {priceOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Min rating */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-text-secondary font-medium">Рейтинг</span>
                  <div className="flex gap-1">
                    {ratingOptions.map(o => (
                      <button
                        key={o.value}
                        onClick={() => setMinRating(o.value)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          minRating === o.value
                            ? 'bg-primary text-white'
                            : 'bg-white border border-border text-text-secondary hover:bg-gray-50'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle pills */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-text-secondary font-medium">Параметры</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setVerifiedOnly(!verifiedOnly)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        verifiedOnly
                          ? 'bg-primary text-white'
                          : 'bg-white border border-border text-text-secondary hover:bg-gray-50'
                      }`}
                    >
                      Проверенные
                    </button>
                    <button
                      onClick={() => setHasDiscounts(!hasDiscounts)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        hasDiscounts
                          ? 'bg-primary text-white'
                          : 'bg-white border border-border text-text-secondary hover:bg-gray-50'
                      }`}
                    >
                      Со скидками
                    </button>
                    <button
                      onClick={() => setWorksWeekends(!worksWeekends)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        worksWeekends
                          ? 'bg-primary text-white'
                          : 'bg-white border border-border text-text-secondary hover:bg-gray-50'
                      }`}
                    >
                      Работает в выходные
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`flex gap-6 ${showMap ? 'flex-col lg:flex-row' : ''}`}>
          {/* Clinic list */}
          <div className={`${showMap ? 'lg:w-1/2' : 'w-full'} space-y-3`}>
            {loading ? (
              <div className="text-center py-16 text-text-secondary text-sm">Загружаем клиники…</div>
            ) : results.length > 0 ? (
              results.map((clinic) => <ClinicCard key={clinic.id} clinic={clinic} />)
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">&#128269;</div>
                <h3 className="text-lg font-semibold text-text mb-2">Ничего не найдено</h3>
                <p className="text-text-secondary text-sm">Попробуйте изменить параметры поиска</p>
                <button
                  onClick={resetAll}
                  className="mt-4 text-primary hover:underline text-sm"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>

          {/* Map */}
          {showMap && (
            <div className="lg:w-1/2 hidden lg:block">
              <div className="sticky top-48 h-[calc(100vh-220px)]">
                <ClinicMapView
                  clinics={results}
                  center={mapCenter}
                  zoom={mapZoom}
                  height="100%"
                  onClinicClick={(id) => navigate(`/clinic/${id}`)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
