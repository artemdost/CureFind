import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useNavigate } from 'react-router-dom';
import type { Clinic } from '../data/clinics';

interface Props {
  clinics: Clinic[];
  height?: string;
  center?: [number, number];
  zoom?: number;
  onClinicClick?: (id: string) => void;
  className?: string;
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c,
  );
}

function popupHtml(props: Record<string, unknown>): string {
  const name = escapeHtml(String(props.name ?? ''));
  const address = escapeHtml(String(props.address ?? ''));
  const rating = Number(props.rating ?? 0).toFixed(1);
  const reviewCount = Number(props.reviewCount ?? 0);
  const minPrice = Number(props.minPrice ?? 0);
  const verified = props.verified === true || props.verified === 'true';
  const id = escapeHtml(String(props.id ?? ''));

  const verifiedBadge = verified
    ? '<span style="display:inline-flex;align-items:center;gap:2px;font-size:10px;font-weight:600;color:#047857;background:#d1fae5;padding:2px 6px;border-radius:4px;margin-left:6px;">✓ проверено</span>'
    : '';

  const priceRow =
    minPrice > 0
      ? `<div style="font-size:12px;color:#6b7280;margin-top:6px;">от <strong style="color:#1e6f9f;">${minPrice.toLocaleString('ru-RU')} ₽</strong></div>`
      : '';

  return `
    <div style="font-family:Inter,system-ui,sans-serif;min-width:220px;padding:2px;">
      <div style="display:flex;align-items:flex-start;gap:4px;">
        <div style="font-weight:600;font-size:14px;color:#1c1917;line-height:1.3;">${name}</div>
      </div>
      <div style="margin-top:2px;">${verifiedBadge}</div>
      <div style="color:#78716c;font-size:12px;margin-top:4px;">${address}</div>
      <div style="display:flex;align-items:center;gap:4px;margin-top:6px;">
        <span style="color:#f59e0b;">★</span>
        <span style="font-size:13px;font-weight:600;color:#1c1917;">${rating}</span>
        <span style="color:#a8a29e;font-size:12px;">(${reviewCount} отзывов)</span>
      </div>
      ${priceRow}
      <a href="/clinic/${id}" data-clinic-id="${id}" class="clinic-popup-link" style="display:inline-block;margin-top:10px;padding:6px 10px;background:#1e6f9f;color:#fff;font-size:12px;font-weight:500;border-radius:6px;text-decoration:none;">Открыть клинику →</a>
    </div>
  `;
}

export default function ClinicMapView({
  clinics,
  height = '400px',
  center,
  zoom = 5,
  onClinicClick,
  className = '',
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const loadedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const defaultCenter: [number, number] = center || [54.9, 46.5];

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [defaultCenter[1], defaultCenter[0]],
      zoom,
    });

    mapInstance.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      map.addSource('clinics', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'clinics',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#60a5fa',
            10,
            '#3b82f6',
            50,
            '#1d4ed8',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 50, 32],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'clinics',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Noto Sans Regular'],
          'text-size': 13,
        },
        paint: { 'text-color': '#ffffff' },
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'clinics',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#f97316',
          'circle-radius': 10,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      });

      map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const f = features[0];
        if (!f) return;
        const clusterId = f.properties?.cluster_id as number | undefined;
        if (clusterId == null) return;
        const source = map.getSource('clinics') as maplibregl.GeoJSONSource;
        try {
          const zoomTo = await source.getClusterExpansionZoom(clusterId);
          const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number];
          map.easeTo({ center: coords, zoom: zoomTo });
        } catch {
          /* noop */
        }
      });

      map.on('click', 'unclustered-point', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const coords = ((feature.geometry as GeoJSON.Point).coordinates as [number, number]).slice() as [number, number];
        popupRef.current?.remove();
        const popup = new maplibregl.Popup({ offset: 18, closeButton: true, maxWidth: '300px' })
          .setLngLat(coords)
          .setHTML(popupHtml(feature.properties || {}))
          .addTo(map);
        popupRef.current = popup;

        const el = popup.getElement();
        const link = el.querySelector<HTMLAnchorElement>('.clinic-popup-link');
        if (link) {
          link.addEventListener('click', (ev) => {
            ev.preventDefault();
            const clinicId = link.dataset.clinicId;
            if (!clinicId) return;
            if (onClinicClick) onClinicClick(clinicId);
            else navigate(`/clinic/${clinicId}`);
            popup.remove();
          });
        }
      });

      ['clusters', 'unclustered-point'].forEach((layer) => {
        map.on('mouseenter', layer, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', layer, () => {
          map.getCanvas().style.cursor = '';
        });
      });

      loadedRef.current = true;
      pushData();
    });

    function pushData() {
      if (!loadedRef.current || !mapInstance.current) return;
      const source = mapInstance.current.getSource('clinics') as maplibregl.GeoJSONSource | undefined;
      if (!source) return;
      source.setData({
        type: 'FeatureCollection',
        features: clinics.map((c) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
          properties: {
            id: c.id,
            name: c.name,
            address: c.address,
            rating: c.rating,
            reviewCount: c.reviewCount,
            verified: c.verified,
            minPrice: c.services.length ? Math.min(...c.services.map((s) => s.price)) : 0,
          },
        })),
      });

      if (clinics.length > 0 && !center) {
        const bounds = new maplibregl.LngLatBounds();
        clinics.forEach((c) => bounds.extend([c.lng, c.lat]));
        mapInstance.current.fitBounds(bounds, { padding: 50, maxZoom: 11, duration: 0 });
      }
    }

    return () => {
      popupRef.current?.remove();
      popupRef.current = null;
      mapInstance.current?.remove();
      mapInstance.current = null;
      loadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !loadedRef.current) return;
    const source = mapInstance.current.getSource('clinics') as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData({
      type: 'FeatureCollection',
      features: clinics.map((c) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
        properties: {
          id: c.id,
          name: c.name,
          address: c.address,
          rating: c.rating,
          reviewCount: c.reviewCount,
          verified: c.verified,
          minPrice: c.services.length ? Math.min(...c.services.map((s) => s.price)) : 0,
        },
      })),
    });

    if (center) {
      mapInstance.current.flyTo({ center: [center[1], center[0]], zoom });
    } else if (clinics.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      clinics.forEach((c) => bounds.extend([c.lng, c.lat]));
      mapInstance.current.fitBounds(bounds, { padding: 50, maxZoom: 11, duration: 400 });
    }
  }, [clinics, center, zoom]);

  return (
    <div
      style={{ height }}
      className={`relative rounded-xl overflow-hidden border border-stone-200 ${className}`}
    >
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {clinics.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-stone-100/90 text-stone-400 text-sm">
          Нет клиник для отображения
        </div>
      )}
    </div>
  );
}
