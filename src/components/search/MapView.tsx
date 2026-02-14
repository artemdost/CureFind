import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Clinic } from '../../data/clinics';

interface MapViewProps {
  clinics: Clinic[];
  onClinicClick?: (clinicId: string) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export default function MapView({ clinics, onClinicClick, center, zoom = 5, className = '' }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const defaultCenter: [number, number] = center || [55.5, 40.5];

    mapInstance.current = new maplibregl.Map({
      container: mapRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap',
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

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: Inter, sans-serif; min-width: 180px;">
          <strong style="font-size: 14px; color: #1a1a2e;">${clinic.name}</strong>
          <div style="color: #6b7280; font-size: 12px; margin: 4px 0;">${clinic.address}</div>
          <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
            <span style="color: #f59e0b;">&#9733;</span>
            <span style="font-size: 13px; font-weight: 600;">${clinic.rating}</span>
            <span style="color: #9ca3af; font-size: 12px;">(${clinic.reviewCount} отзывов)</span>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([clinic.lng, clinic.lat])
        .setPopup(popup)
        .addTo(mapInstance.current!);

      if (onClinicClick) {
        el.addEventListener('click', () => onClinicClick(clinic.id));
      }

      markersRef.current.push(marker);
    });

    if (center) {
      mapInstance.current.flyTo({ center: [center[1], center[0]], zoom });
    } else if (clinics.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      clinics.forEach(c => bounds.extend([c.lng, c.lat]));
      mapInstance.current.fitBounds(bounds, { padding: 40, maxZoom: 12 });
    }
  }, [clinics, center, zoom, onClinicClick]);

  return <div ref={mapRef} className={`w-full h-full min-h-[300px] ${className}`} />;
}
