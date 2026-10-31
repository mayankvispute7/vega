'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createRoot, type Root } from 'react-dom/client';
import { ROUTE_POLYLINE, ALTERNATE_POLYLINE, JUNCTIONS, ORIGIN, DESTINATION } from '@/lib/data/corridor';
import { interpolateAlongPolyline } from '@/lib/utils/geo';
import { useTripStore } from '@/store/tripStore';
import { useJunctionStore } from '@/store/junctionStore';
import { useUiStore } from '@/store/uiStore';
import { useRerouteStore } from '@/store/rerouteStore';
import { AmbulanceMarker } from './AmbulanceMarker';
import { JunctionNode } from './JunctionNode';

if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
}

export function MapCanvas() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const ambulanceMarkerRef = useRef<maplibregl.Marker | null>(null);
  const ambulanceRootRef = useRef<Root | null>(null);
  const junctionRootsRef = useRef<Map<string, { marker: maplibregl.Marker; root: Root }>>(new Map());

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const { vehicle } = useTripStore();
  const { tasks } = useJunctionStore();
  const { selectedJunctionId } = useUiStore();
  const { proposal } = useRerouteStore();

  // Interpolated position and bearing
  const { coords: currentVehicleCoords, bearing } = useMemo(() => {
    return interpolateAlongPolyline(ROUTE_POLYLINE, vehicle.progressRatio);
  }, [vehicle.progressRatio]);

function isWebGLSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

  // 1. Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (!isWebGLSupported()) {
      setMapError(true);
      return;
    }

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            'carto-dark': {
              type: 'raster',
              tiles: [
                'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              ],
              tileSize: 256,
              attribution: '© CARTO, © OpenStreetMap (simulated)',
            },
          },
          layers: [
            {
              id: 'carto-dark-base',
              type: 'raster',
              source: 'carto-dark',
              minzoom: 0,
              maxzoom: 20,
            },
          ],
        },
        center: [73.822, 18.506],
        zoom: 13.6,
        pitch: 20,
        bearing: -15,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

      map.on('load', () => {
        // Add primary route GeoJSON
        map.addSource('primary-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: ROUTE_POLYLINE,
            },
          },
        });

        // Glowing outer line
        map.addLayer({
          id: 'primary-route-glow',
          type: 'line',
          source: 'primary-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#2DD4BF',
            'line-width': 8,
            'line-opacity': 0.35,
            'line-blur': 3,
          },
        });

        // Core line
        map.addLayer({
          id: 'primary-route-core',
          type: 'line',
          source: 'primary-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#2DD4BF',
            'line-width': 3.5,
            'line-opacity': 0.95,
          },
        });

        // Add alternate detour route GeoJSON
        map.addSource('alternate-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: ALTERNATE_POLYLINE,
            },
          },
        });

        map.addLayer({
          id: 'alternate-route-line',
          type: 'line',
          source: 'alternate-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#FFBE5C',
            'line-width': 3,
            'line-dasharray': [2, 2],
            'line-opacity': 0.75,
          },
        });

        // Create ambulance marker
        const ambEl = document.createElement('div');
        const ambRoot = createRoot(ambEl);
        ambRoot.render(<AmbulanceMarker bearing={bearing} />);
        ambulanceRootRef.current = ambRoot;

        const ambMarker = new maplibregl.Marker({ element: ambEl })
          .setLngLat(currentVehicleCoords)
          .addTo(map);
        ambulanceMarkerRef.current = ambMarker;

        // Create junction markers
        JUNCTIONS.forEach((j, idx) => {
          const el = document.createElement('div');
          const root = createRoot(el);
          root.render(
            <JunctionNode
              junction={j}
              index={idx}
              task={tasks[j.id]}
              isSelected={selectedJunctionId === j.id}
            />
          );
          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(j.coords)
            .addTo(map);

          junctionRootsRef.current.set(j.id, { marker, root });
        });

        setMapLoaded(true);
      });

      map.on('error', (e) => {
        if (
          e.error?.message?.toLowerCase().includes('webgl') ||
          e.error?.message?.toLowerCase().includes('context lost')
        ) {
          setMapError(true);
        } else {
          console.warn('MapLibre warning:', e.error?.message ?? e);
        }
      });

      mapRef.current = map;
    } catch (err) {
      console.error('Failed to initialize MapLibre map:', err);
      setMapError(true);
    }

    return () => {
      if (ambulanceRootRef.current) {
        ambulanceRootRef.current.unmount();
        ambulanceRootRef.current = null;
      }
      junctionRootsRef.current.forEach(({ root, marker }) => {
        root.unmount();
        marker.remove();
      });
      junctionRootsRef.current.clear();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Update ambulance marker position & rotation
  useEffect(() => {
    if (ambulanceMarkerRef.current) {
      ambulanceMarkerRef.current.setLngLat(currentVehicleCoords);
    }
    if (ambulanceRootRef.current) {
      ambulanceRootRef.current.render(<AmbulanceMarker bearing={bearing} />);
    }
  }, [currentVehicleCoords, bearing]);

  // 3. Update junction markers when store changes
  useEffect(() => {
    JUNCTIONS.forEach((j, idx) => {
      const entry = junctionRootsRef.current.get(j.id);
      if (entry) {
        entry.root.render(
          <JunctionNode
            junction={j}
            index={idx}
            task={tasks[j.id]}
            isSelected={selectedJunctionId === j.id}
          />
        );
      }
    });
  }, [tasks, selectedJunctionId]);

  // 4. Update alternate route visibility
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    try {
      const isVisible = proposal !== null;
      mapRef.current.setLayoutProperty(
        'alternate-route-line',
        'visibility',
        isVisible ? 'visible' : 'none'
      );
    } catch {
      // ignore
    }
  }, [proposal, mapLoaded]);

  // If map fails or WebGL unavailable, render graceful dark vector fallback
  if (mapError) {
    return <MapCanvasFallback />;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating map status overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(10, 18, 34, 0.88)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '6px 10px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(8px)',
          zIndex: 2,
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--teal)' }} />
        <span>MapLibre GL · CARTO Dark Matter (Pune Corridor)</span>
      </div>
    </div>
  );
}

/**
 * Graceful SVG Fallback if MapLibre fails or WebGL is disabled
 */
function MapCanvasFallback() {
  const { vehicle } = useTripStore();
  const { tasks } = useJunctionStore();
  const { selectedJunctionId, selectJunction } = useUiStore();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0A1222 0%, #0d1929 50%, #0A1222 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2DD4BF" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Route polyline in fallback */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <polyline
          points="14%,42% 28%,35% 44%,44% 60%,48% 76%,40% 88%,46%"
          fill="none"
          stroke="var(--teal)"
          strokeWidth="3"
          strokeDasharray="6 4"
          opacity="0.8"
        />
      </svg>

      {/* Junction Nodes */}
      {JUNCTIONS.map((j, i) => {
        const x = 20 + (i / 4) * 64;
        const y = 40 + Math.sin(i * 0.9) * 16;
        return (
          <div
            key={j.id}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%,-50%)',
            }}
          >
            <JunctionNode
              junction={j}
              index={i}
              task={tasks[j.id]}
              isSelected={selectedJunctionId === j.id}
            />
          </div>
        );
      })}

      {/* Vehicle Marker */}
      <div
        style={{
          position: 'absolute',
          left: `${14 + vehicle.progressRatio * 74}%`,
          top: `${42 - Math.sin(vehicle.progressRatio * 3) * 6}%`,
          transform: 'translate(-50%,-50%)',
          transition: 'left 200ms linear, top 200ms linear',
        }}
      >
        <AmbulanceMarker />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(10,18,34,0.85)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '6px 10px',
          fontSize: '11px',
          color: 'var(--amber)',
        }}
      >
        ⚠ Offline Canvas Fallback Active
      </div>
    </div>
  );
}
