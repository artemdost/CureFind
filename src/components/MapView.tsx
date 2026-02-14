import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Link } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import type { Clinic } from '../data/clinics';

interface MapViewProps {
  clinics: Clinic[];
  height?: string;
  center?: [number, number];
  zoom?: number;
}

function PopupContent({ clinic }: { clinic: Clinic }) {
  return (
    <div className="text-sm">
      <p className="font-semibold text-stone-800 mb-0.5">{clinic.name}</p>
      <p className="text-stone-500 text-xs mb-1">{clinic.address}</p>
      <p className="text-stone-600 text-xs mb-2">{clinic.rating} / 5 &middot; {clinic.reviewCount} отзывов</p>
      <Link
        to={`/clinic/${clinic.id}`}
        className="text-primary text-xs font-medium hover:underline"
      >
        Открыть клинику &rarr;
      </Link>
    </div>
  );
}

export default function MapView({
  clinics,
  height = '400px',
  center,
  zoom = 6,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const defaultCenter: [number, number] = center || [54.9, 46.5];

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = new maplibregl.Map({
      container: mapRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: [defaultCenter[1], defaultCenter[0]],
      zoom,
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    clinics.forEach(clinic => {
      const el = document.createElement('div');
      el.className = 'clinic-marker';
      el.textContent = String(clinic.rating);

      const popupNode = document.createElement('div');
      const root = createRoot(popupNode);
      root.render(<PopupContent clinic={clinic} />);

      const popup = new maplibregl.Popup({ offset: 25 }).setDOMContent(popupNode);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([clinic.lng, clinic.lat])
        .setPopup(popup)
        .addTo(mapInstance.current!);

      markersRef.current.push(marker);
    });
  }, [clinics]);

  if (clinics.length === 0) {
    return (
      <div
        className="bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 text-sm"
        style={{ height }}
      >
        Нет клиник для отображения
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-stone-200">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
