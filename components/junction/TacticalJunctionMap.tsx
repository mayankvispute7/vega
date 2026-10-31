'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createRoot, type Root } from 'react-dom/client';
import type { Junction } from '@/lib/types';
import { ROUTE_POLYLINE } from '@/lib/data/corridor';
import { JUNCTION_TACTICAL_DATA } from '@/lib/data/tacticalDirectives';
import { interpolateAlongPolyline } from '@/lib/utils/geo';
import { useTripStore } from '@/store/tripStore';
import { useJunctionStore } from '@/store/junctionStore';
import { formatSeconds } from '@/hooks/useCountdown';

if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
}

interface TacticalJunctionMapProps {
  junction: Junction;
}

export function TacticalJunctionMap({ junction }: TacticalJunctionMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const ambulanceMarkerRef = useRef<maplibregl.Marker | null>(null);
  const ambulanceRootRef = useRef<Root | null>(null);
  const htmlMarkersRef = useRef<{ marker: maplibregl.Marker; root: Root }[]>([]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'junction' | 'corridor'>('junction');

  const { vehicle } = useTripStore();
  const { tasks } = useJunctionStore();
  const task = tasks[junction.id];
  const eta = task?.etaSeconds ?? 0;
  const status = task?.status ?? 'Scheduled';

  const tacticalData = JUNCTION_TACTICAL_DATA[junction.id] ?? JUNCTION_TACTICAL_DATA['J1'];

  // Current interpolated ambulance position along the corridor
  const { coords: ambulanceCoords, bearing } = useMemo(() => {
    return interpolateAlongPolyline(ROUTE_POLYLINE, vehicle.progressRatio);
  }, [vehicle.progressRatio]);

  // 1. Initialize MapLibre ONCE
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

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
        center: junction.coords,
        zoom: 16.2,
        pitch: 22,
        bearing: -10,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

      map.on('load', () => {
        // A. Full corridor background path
        map.addSource('full-route', {
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
        map.addLayer({
          id: 'full-route-casing',
          type: 'line',
          source: 'full-route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#0B2545',
            'line-width': 4,
            'line-opacity': 0.25,
          },
        });

        // B. Green Corridor Priority Approach
        map.addSource('green-corridor', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: tacticalData.greenSegment,
            },
          },
        });

        map.addLayer({
          id: 'green-corridor-glow',
          type: 'line',
          source: 'green-corridor',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#10B981',
            'line-width': 13,
            'line-opacity': 0.38,
          },
        });

        map.addLayer({
          id: 'green-corridor-core',
          type: 'line',
          source: 'green-corridor',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#059669',
            'line-width': 6,
            'line-opacity': 0.95,
          },
        });

        // C. Red Cross-traffic approaches that must be BLOCKED
        const crossBlocksGeoJson = {
          type: 'FeatureCollection' as const,
          features: tacticalData.crossRoadBlocks.map((b) => ({
            type: 'Feature' as const,
            properties: { name: b.name, action: b.action },
            geometry: {
              type: 'LineString' as const,
              coordinates: b.approachLine,
            },
          })),
        };

        map.addSource('cross-blocks', {
          type: 'geojson',
          data: crossBlocksGeoJson,
        });

        map.addLayer({
          id: 'cross-blocks-line',
          type: 'line',
          source: 'cross-blocks',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#DC2626',
            'line-width': 6,
            'line-dasharray': [2, 1.5],
            'line-opacity': 0.9,
          },
        });

        map.resize();
        setMapLoaded(true);
      });

      mapRef.current = map;

      // Ensure canvas adjusts if flex layout settles
      setTimeout(() => {
        map.resize();
      }, 200);
    } catch (e) {
      console.warn('MapLibre init error:', e);
    }

    return () => {
      // Unmount React marker roots
      if (ambulanceRootRef.current) {
        const root = ambulanceRootRef.current;
        ambulanceRootRef.current = null;
        setTimeout(() => root.unmount(), 0);
      }
      htmlMarkersRef.current.forEach(({ root, marker }) => {
        marker.remove();
        setTimeout(() => root.unmount(), 0);
      });
      htmlMarkersRef.current = [];

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Run once on mount!

  // 2. Update GeoJSON sources and fly to junction when junction.id changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    map.flyTo({
      center: junction.coords,
      zoom: viewMode === 'junction' ? 16.2 : 14.8,
      essential: true,
      duration: 600,
    });

    // Update Green Corridor line
    const greenSource = map.getSource('green-corridor') as maplibregl.GeoJSONSource | undefined;
    if (greenSource) {
      greenSource.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: tacticalData.greenSegment,
        },
      });
    }

    // Update Red Blocked Approaches line
    const crossSource = map.getSource('cross-blocks') as maplibregl.GeoJSONSource | undefined;
    if (crossSource) {
      crossSource.setData({
        type: 'FeatureCollection',
        features: tacticalData.crossRoadBlocks.map((b) => ({
          type: 'Feature',
          properties: { name: b.name, action: b.action },
          geometry: {
            type: 'LineString',
            coordinates: b.approachLine,
          },
        })),
      });
    }
  }, [junction.id, tacticalData, mapLoaded, viewMode]);

  // 3. Render HTML Markers on Map: Junction Node, Stop Barricades, Green Priority Badges
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Clear previous HTML markers
    htmlMarkersRef.current.forEach(({ root, marker }) => {
      marker.remove();
      setTimeout(() => root.unmount(), 0);
    });
    htmlMarkersRef.current = [];

    // A. Main Junction Center Marker
    const juncEl = document.createElement('div');
    const juncRoot = createRoot(juncEl);
    const isReady = status === 'Ready';
    const statusBg = isReady ? '#15803D' : status === 'Preparing' ? '#B45309' : '#1D4ED8';

    juncRoot.render(
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          style={{
            background: statusBg,
            color: '#FFFFFF',
            border: '2px solid #FFFFFF',
            borderRadius: '16px',
            padding: '3px 8px',
            fontSize: '11px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono, monospace)',
            boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          <span>🚦</span>
          <span>{junction.id} · {junction.name.split(' ')[0]}</span>
        </div>
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: statusBg,
            border: '2.5px solid #FFFFFF',
            boxShadow: `0 0 0 4px ${isReady ? 'rgba(21, 128, 61, 0.4)' : 'rgba(29, 78, 216, 0.4)'}`,
            marginTop: '2px',
          }}
        />
      </div>
    );

    const juncMarker = new maplibregl.Marker({ element: juncEl, anchor: 'center' })
      .setLngLat(junction.coords)
      .addTo(map);

    htmlMarkersRef.current.push({ root: juncRoot, marker: juncMarker });

    // B. Barricade / Stop Red Markers on Cross Roads
    tacticalData.crossRoadBlocks.forEach((block) => {
      const barEl = document.createElement('div');
      const barRoot = createRoot(barEl);

      barRoot.render(
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: '#B91C1C',
              color: '#FFFFFF',
              border: '1.5px solid #FFFFFF',
              borderRadius: '6px',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 800,
              boxShadow: '0 2px 6px rgba(185, 28, 28, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            <span>⛔</span>
            <span>HOLD RED</span>
          </div>
          <div
            style={{
              fontSize: '9px',
              color: '#991B1B',
              fontWeight: 800,
              background: 'rgba(255,255,255,0.96)',
              padding: '1px 5px',
              borderRadius: '3px',
              marginTop: '1px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
              whiteSpace: 'nowrap',
            }}
          >
            {block.name.split(' ')[0]}
          </div>
        </div>
      );

      const barMarker = new maplibregl.Marker({ element: barEl, anchor: 'center' })
        .setLngLat(block.barrierPoint)
        .addTo(map);

      htmlMarkersRef.current.push({ root: barRoot, marker: barMarker });
    });

    // C. Green Wave Direction Badge on approach
    if (tacticalData.greenSegment.length > 1) {
      const approachPoint = tacticalData.greenSegment[1];
      const greenEl = document.createElement('div');
      const greenRoot = createRoot(greenEl);

      greenRoot.render(
        <div
          style={{
            background: '#047857',
            color: '#FFFFFF',
            border: '1.5px solid #FFFFFF',
            borderRadius: '6px',
            padding: '2px 7px',
            fontSize: '10px',
            fontWeight: 800,
            boxShadow: '0 2px 6px rgba(4, 120, 87, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <span>🟢</span>
          <span>HOLD GREEN WAVE</span>
        </div>
      );

      const greenMarker = new maplibregl.Marker({ element: greenEl, anchor: 'center' })
        .setLngLat(approachPoint)
        .addTo(map);

      htmlMarkersRef.current.push({ root: greenRoot, marker: greenMarker });
    }
  }, [junction, status, mapLoaded, tacticalData]);

  // 4. Update Live Ambulance Marker position
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    if (!ambulanceMarkerRef.current) {
      const ambEl = document.createElement('div');
      ambulanceRootRef.current = createRoot(ambEl);
      ambulanceMarkerRef.current = new maplibregl.Marker({
        element: ambEl,
        anchor: 'center',
      })
        .setLngLat(ambulanceCoords)
        .addTo(map);
    } else {
      ambulanceMarkerRef.current.setLngLat(ambulanceCoords);
    }

    if (ambulanceRootRef.current) {
      ambulanceRootRef.current.render(
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: '#DC2626',
              color: '#FFFFFF',
              border: '1.5px solid #FFFFFF',
              borderRadius: '12px',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.45)',
              whiteSpace: 'nowrap',
            }}
          >
            <span>🚑</span>
            <span>AMB-108 · {vehicle.speedKmh} km/h</span>
          </div>
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#DC2626',
              border: '2.5px solid #FFFFFF',
              boxShadow: '0 0 0 4px rgba(220, 38, 38, 0.3)',
              marginTop: '1px',
              transform: `rotate(${bearing}deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#FFFFFF',
            }}
          >
            ▲
          </div>
        </div>
      );
    }
  }, [ambulanceCoords, bearing, vehicle.speedKmh, mapLoaded]);

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header bar of Tactical Map */}
      <div
        style={{
          padding: '10px 14px',
          background: '#EEF3F9',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px' }}>🗺️</span>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tactical Intersection Map
            </span>
            <span style={{ fontSize: '11px', color: '#5B6B80', marginLeft: '6px' }}>
              · {junction.name}
            </span>
          </div>
        </div>

        {/* View Toggle Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => {
              setViewMode('junction');
              if (mapRef.current) {
                mapRef.current.flyTo({ center: junction.coords, zoom: 16.2, duration: 600 });
              }
            }}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '5px',
              border: viewMode === 'junction' ? '1px solid #0B2545' : '1px solid #D6DFEA',
              background: viewMode === 'junction' ? '#0B2545' : '#FFFFFF',
              color: viewMode === 'junction' ? '#FFFFFF' : '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>🎯</span>
            <span>Chowk Focus</span>
          </button>

          <button
            onClick={() => {
              setViewMode('corridor');
              if (mapRef.current) {
                mapRef.current.flyTo({ center: junction.coords, zoom: 14.8, duration: 600 });
              }
            }}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '5px',
              border: viewMode === 'corridor' ? '1px solid #0B2545' : '1px solid #D6DFEA',
              background: viewMode === 'corridor' ? '#0B2545' : '#FFFFFF',
              color: viewMode === 'corridor' ? '#FFFFFF' : '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>📐</span>
            <span>Corridor Approach</span>
          </button>
        </div>
      </div>

      {/* Map Canvas / Fallback Area */}
      <div style={{ position: 'relative', width: '100%', height: '270px', background: '#E2E8F0' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating Directional Banner overlay on top of map */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(4px)',
              border: '1.5px solid #86EFAC',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11px',
              color: '#065F46',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span>GREEN WAVE: {tacticalData.corridorGreenLanes}</span>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(4px)',
              border: '1.5px solid #FCA5A5',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11px',
              color: '#991B1B',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <span>⛔</span>
            <span>BLOCK {tacticalData.crossRoadBlocks.length} CROSS-STREET FEEDERS (HOLD RED)</span>
          </div>
        </div>

        {/* Live Bottom HUD Strip on Map */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            background: 'rgba(11, 37, 69, 0.92)',
            backdropFilter: 'blur(6px)',
            borderRadius: '8px',
            padding: '7px 12px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            zIndex: 5,
            boxShadow: '0 4px 12px rgba(11, 37, 69, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>🚑</span>
            <span style={{ fontWeight: 700 }}>AMBULANCE ETA:</span>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', color: '#34D399', fontWeight: 800, fontSize: '13px' }}>
              {formatSeconds(Math.round(eta))}
            </span>
            <span style={{ color: '#94A3B8' }}>·</span>
            <span style={{ color: '#CBD5E1' }}>Speed: {vehicle.speedKmh} km/h</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#94A3B8', fontSize: '10px' }}>STATUS:</span>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 800,
                color: status === 'Ready' ? '#86EFAC' : status === 'Preparing' ? '#FCD34D' : '#93C5FD',
              }}
            >
              {status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Road Block & Green Wave Action Directives Card */}
      <div style={{ padding: '12px 14px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Signal Phase Directives for Field Officer
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          {/* Directive 1: Green Corridor */}
          <div
            style={{
              background: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>🟢</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#15803D' }}>
                  HOLD GREEN WAVE (PHASE 1)
                </span>
              </div>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  background: '#DCFCE7',
                  color: '#15803D',
                  padding: '1px 5px',
                  borderRadius: '4px',
                }}
              >
                CORRIDOR
              </span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', marginTop: '2px' }}>
              {tacticalData.corridorGreenName}
            </div>
            <div style={{ fontSize: '11px', color: '#14532D', lineHeight: 1.4 }}>
              {tacticalData.corridorGreenDirective}
            </div>
          </div>

          {/* Directive 2: Block Feeder Roads */}
          <div
            style={{
              background: '#FEF2F2',
              border: '1.5px solid #FECACA',
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>🛑</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#B91C1C' }}>
                  ROADS TO BLOCK (HOLD RED)
                </span>
              </div>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  background: '#FEE2E2',
                  color: '#B91C1C',
                  padding: '1px 5px',
                  borderRadius: '4px',
                }}
              >
                {tacticalData.crossRoadBlocks.length} APPROACHES
              </span>
            </div>
            {tacticalData.crossRoadBlocks.map((block) => (
              <div key={block.id} style={{ fontSize: '11px', color: '#991B1B', marginTop: '2px', lineHeight: 1.35 }}>
                • <strong>{block.name}</strong> ({block.fromDirection}): {block.directive}
              </div>
            ))}
          </div>
        </div>

        {/* Pedestrian Phase & Flow Divert tips */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '11px',
            color: '#475569',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🚷</span>
            <span><strong>Pedestrian Protocol:</strong> {tacticalData.pedestrianDirective}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F766E', fontWeight: 600 }}>
            <span>💡</span>
            <span>{tacticalData.divertLaneTip}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
