'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createRoot, type Root } from 'react-dom/client';
import { ROUTE_POLYLINE, ALTERNATE_POLYLINE, JUNCTIONS } from '@/lib/data/corridor';
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

  // 1. Initialize MapLibre with OpenStreetMap light tiles (zero API key, crystal clear)
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
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [
            {
              id: 'osm-base',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [73.822, 18.506],
        zoom: 14,
        pitch: 15,
        bearing: -10,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

      map.on('load', () => {
        // Primary route GeoJSON
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

        // 1. Crisp white outer casing for maximum visibility on light maps
        map.addLayer({
          id: 'primary-route-casing',
          type: 'line',
          source: 'primary-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#FFFFFF',
            'line-width': 7.5,
            'line-opacity': 0.95,
          },
        });

        // 2. Deep Teal core route line (#0F766E)
        map.addLayer({
          id: 'primary-route-core',
          type: 'line',
          source: 'primary-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#0F766E',
            'line-width': 4.5,
            'line-opacity': 1,
          },
        });

        // Alternate detour route GeoJSON
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
            'line-color': '#B45309',
            'line-width': 3.5,
            'line-dasharray': [3, 2],
            'line-opacity': 0.85,
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
          console.warn('Map warning:', e.error?.message ?? e);
        }
      });

      mapRef.current = map;
    } catch (err) {
      console.error('Failed to initialize MapLibre map:', err);
      setMapError(true);
    }

    // Cleanup: schedule root unmounting asynchronously to avoid React rendering race condition
    return () => {
      const ambRoot = ambulanceRootRef.current;
      ambulanceRootRef.current = null;
      if (ambulanceMarkerRef.current) {
        ambulanceMarkerRef.current.remove();
        ambulanceMarkerRef.current = null;
      }

      const jEntries = Array.from(junctionRootsRef.current.values());
      junctionRootsRef.current.clear();

      setTimeout(() => {
        try { ambRoot?.unmount(); } catch {}
        jEntries.forEach(({ root, marker }) => {
          try { root.unmount(); } catch {}
          try { marker.remove(); } catch {}
        });
      }, 0);

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

  // If map fails or WebGL unavailable, render graceful light vector fallback
  if (mapError) {
    return <MapCanvasFallback />;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating map status badge (Clean government style) */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--navy)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-card)',
          zIndex: 2,
        }}
      >
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16A34A' }} />
        <span>OpenStreetMap Corridor Base · Pune Central (MH-12)</span>
      </div>
    </div>
  );
}

/**
 * Graceful Light SVG Fallback if MapLibre fails or WebGL is disabled
 */
function MapCanvasFallback() {
  const { vehicle } = useTripStore();
  const { tasks } = useJunctionStore();
  const { selectedJunctionId } = useUiStore();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--bg)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }}>
        <defs>
          <pattern id="light-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D6DFEA" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#light-grid)" />
      </svg>

      {/* Route polyline in fallback */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <polyline
          points="14%,42% 28%,35% 44%,44% 60%,48% 76%,40% 88%,46%"
          fill="none"
          stroke="#0F766E"
          strokeWidth="4"
          strokeDasharray="6 4"
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
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--warn)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        ⚠ Vector Fallback Grid Active
      </div>
    </div>
  );
}
