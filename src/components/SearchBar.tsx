import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPECIALTIES } from '../lib/api';
import { useRegions } from '../hooks/useClinics';

interface SearchBarProps {
  initialRegion?: string;
  initialService?: string;
  compact?: boolean;
}

export default function SearchBar({ initialRegion = '', initialService = '', compact = false }: SearchBarProps) {
  const [region, setRegion] = useState(initialRegion);
  const [service, setService] = useState(initialService);
  const navigate = useNavigate();
  const { regions } = useRegions();
  const specialties = SPECIALTIES;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (region) params.set('region', region);
    if (service) params.set('specialty', service);
    navigate(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (compact) {
    return (
      <div className="flex gap-2" onKeyDown={handleKeyDown}>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="search-select flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="">Все регионы</option>
          {regions.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="search-select flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="">Все услуги</option>
          {specialties.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          Найти
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-3 sm:p-4" onKeyDown={handleKeyDown}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-stone-400 mb-1 px-1">Город</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="search-select w-full bg-stone-50 border-0 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Все регионы</option>
            {regions.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-medium text-stone-400 mb-1 px-1">Что ищете</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="search-select w-full bg-stone-50 border-0 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Все направления</option>
            {specialties.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            Найти клинику
          </button>
        </div>
      </div>
    </div>
  );
}
