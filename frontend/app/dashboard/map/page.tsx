'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Crosshair,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Ship,
  Maximize2,
  Navigation,
  Globe,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface TargetPin {
  id: string;
  label: string;
  confidence: number;
  severity: 'critical' | 'high' | 'medium';
  lat: number;
  lon: number;
  depth: number;
  area_m2: number;
  vessel: string;
  status: 'Unassigned' | 'Mission Dispatched' | 'Cleared';
}

const LIVE_TARGETS: TargetPin[] = [
  {
    id: 'GNET-8821',
    label: 'Synthetic Gillnet Cluster',
    confidence: 0.94,
    severity: 'critical',
    lat: 11.560889,
    lon: 79.800671,
    depth: 42.5,
    area_m2: 18.4,
    vessel: 'RV-OCEANUS',
    status: 'Mission Dispatched',
  },
  {
    id: 'GNET-8819',
    label: 'Abandoned Polypropylene Rope',
    confidence: 0.88,
    severity: 'high',
    lat: 11.856251,
    lon: 79.880480,
    depth: 38.0,
    area_m2: 8.2,
    vessel: 'AUV-NEPTUNE-02',
    status: 'Unassigned',
  },
  {
    id: 'GNET-8815',
    label: 'Snagged Trawl Net on Reef',
    confidence: 0.91,
    severity: 'critical',
    lat: 13.325614,
    lon: 80.410923,
    depth: 54.2,
    area_m2: 26.5,
    vessel: 'RV-OCEANUS',
    status: 'Mission Dispatched',
  },
  {
    id: 'GNET-8809',
    label: 'Submerged Crab Trap Cage',
    confidence: 0.79,
    severity: 'medium',
    lat: 17.633693,
    lon: 83.328583,
    depth: 29.8,
    area_m2: 4.1,
    vessel: 'AUV-NEPTUNE-01',
    status: 'Cleared',
  },
  {
    id: 'GNET-8798',
    label: 'Heavy Monofilament Webbing',
    confidence: 0.85,
    severity: 'high',
    lat: 20.835254,
    lon: 87.057524,
    depth: 46.0,
    area_m2: 12.0,
    vessel: 'RV-OCEANUS',
    status: 'Unassigned',
  },
];

type GoogleMapLayer = 'satellite' | 'terrain' | 'roadmap';

const GOOGLE_TILE_LAYERS: Record<GoogleMapLayer, { name: string; url: string; subdomains: string[] }> = {
  satellite: {
    name: 'Google Satellite Hybrid',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
  },
  terrain: {
    name: 'Google Seafloor Terrain',
    url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
  },
  roadmap: {
    name: 'Google Nautical Grid',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
  },
};

export default function SurveyGoogleMapPage() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});

  const [activeLayer, setActiveLayer] = useState<GoogleMapLayer>('satellite');
  const [selectedTargetId, setSelectedTargetId] = useState<string>(LIVE_TARGETS[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedTarget = LIVE_TARGETS.find((t) => t.id === selectedTargetId) ?? LIVE_TARGETS[0];

  const filteredTargets = LIVE_TARGETS.filter(
    (t) =>
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vessel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Initialize Leaflet Map with Google Maps Tiles
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;
    let isCancelled = false;

    import('leaflet').then((leafletModule) => {
      if (isCancelled || !mapContainerRef.current) return;
      L = leafletModule.default || leafletModule;

      // Prevent re-initialization
      if (mapInstanceRef.current) return;

      // Centered on Bay of Bengal / East Coast of India
      const map = L.map(mapContainerRef.current, {
        center: [16.0, 83.5],
        zoom: 6,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add active Google Map tile layer
      const layerConfig = GOOGLE_TILE_LAYERS[activeLayer];
      const tileLayer = L.tileLayer(layerConfig.url, {
        subdomains: layerConfig.subdomains,
        maxZoom: 20,
        attribution: 'Map data &copy; Google Maps',
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;

      const latLngs: [number, number][] = [];

      // Plot the 5 Live Target Pins
      LIVE_TARGETS.forEach((target) => {
        latLngs.push([target.lat, target.lon]);

        const color =
          target.severity === 'critical'
            ? '#EF4444'
            : target.severity === 'high'
            ? '#F59E0B'
            : '#10B981';

        const customIcon = L.divIcon({
          className: 'custom-target-marker',
          html: `
            <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
              <span style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: ${color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <div style="position: relative; width: 24px; height: 24px; border-radius: 50%; background: ${color}; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 10px;">
                ⚓
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([target.lat, target.lon], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; min-width: 170px;">
              <strong style="color: #0F172A; font-size: 13px;">${target.id}</strong><br/>
              <span style="color: #475569; font-weight: 600;">${target.label}</span><br/>
              <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #64748B;">
                Depth: <strong>${target.depth}m</strong> | Area: <strong>${target.area_m2}m²</strong><br/>
                Coordinates: <strong>${target.lat.toFixed(6)}°N, ${target.lon.toFixed(6)}°E</strong>
              </div>
            </div>
          `);

        marker.on('click', () => {
          setSelectedTargetId(target.id);
        });

        markersRef.current[target.id] = marker;
      });

      // Check if redirected to focus a specific target
      let initialFocusId: string | null = null;
      try {
        initialFocusId =
          sessionStorage.getItem('ghostnet_focus_target') ||
          new URLSearchParams(window.location.search).get('targetId');
        if (initialFocusId) {
          sessionStorage.removeItem('ghostnet_focus_target');
        }
      } catch {
        // ignore
      }

      if (initialFocusId && markersRef.current[initialFocusId]) {
        setSelectedTargetId(initialFocusId);
        const focusedTarget = LIVE_TARGETS.find((t) => t.id === initialFocusId);
        if (focusedTarget) {
          map.flyTo([focusedTarget.lat, focusedTarget.lon], 13, { duration: 1.5 });
          setTimeout(() => {
            markersRef.current[initialFocusId!]?.openPopup();
          }, 800);
        }
      } else if (latLngs.length > 0) {
        // Fit bounds to show all 5 coordinates nicely
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Google Map Layer when activeLayer changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    import('leaflet').then((leafletModule) => {
      const L = leafletModule.default || leafletModule;
      mapInstanceRef.current.removeLayer(tileLayerRef.current);

      const layerConfig = GOOGLE_TILE_LAYERS[activeLayer];
      const newLayer = L.tileLayer(layerConfig.url, {
        subdomains: layerConfig.subdomains,
        maxZoom: 20,
        attribution: 'Map data &copy; Google Maps',
      }).addTo(mapInstanceRef.current);

      tileLayerRef.current = newLayer;
    });
  }, [activeLayer]);

  // Pan & Focus map when target is selected from list
  const focusOnTarget = (target: TargetPin) => {
    setSelectedTargetId(target.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.lat, target.lon], 14, {
        duration: 1.2,
      });
      const marker = markersRef.current[target.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const openInGoogleMaps = (lat: number, lon: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lon}`, '_blank');
  };

  const sendToWorkstation = (target: TargetPin) => {
    try {
      sessionStorage.setItem('ghostnet_snapshot_source', target.id);
      sessionStorage.setItem('ghostnet_target_lat', target.lat.toString());
      sessionStorage.setItem('ghostnet_target_lon', target.lon.toString());
    } catch {
      // ignore
    }
    router.push('/dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans rounded-none">
      {/* ── Top Header Toolbar Card (0 Curves, Solid Ocean Theme) ── */}
      <div className="light-saas-card p-6 flex flex-wrap items-center justify-between gap-4 rounded-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[#075A73] flex items-center justify-center text-white shadow-none">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#0E232B]">
              Google Maps Seabed & Ghost Net Geolocation
            </h1>
            <span className="text-xs text-[#526E78] font-medium">
              Real-world satellite & seabed coordinates for active detected marine debris
            </span>
          </div>
        </div>

        {/* Google Maps Layer Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#E5EDEE] rounded-none p-1 border border-[#B8C9CC] text-xs font-bold">
            {(['satellite', 'terrain', 'roadmap'] as const).map((layerKey) => (
              <button
                key={layerKey}
                onClick={() => setActiveLayer(layerKey)}
                className={`px-3 py-1.5 rounded-none capitalize transition-all ${
                  activeLayer === layerKey
                    ? 'bg-white text-[#075A73] shadow-none font-bold'
                    : 'text-[#526E78] hover:text-[#0E232B]'
                }`}
              >
                {layerKey}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main View: Real Google Map + Target Geolocation Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch rounded-none">
        {/* Left Column: Interactive Google Map Viewport (8 cols on lg) */}
        <div className="lg:col-span-8 light-saas-card p-6 flex flex-col justify-between space-y-4 rounded-none">
          <div className="flex items-center justify-between text-xs font-bold text-[#526E78] uppercase tracking-wider pb-2 border-b border-[#B8C9CC]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-none bg-emerald-600 animate-pulse" />
              <span>GOOGLE SATELLITE: EAST COAST SHELF (BAY OF BENGAL CORRIDOR)</span>
            </div>
            <span className="text-[#075A73] font-mono font-bold">5 TARGETS PLOTTED</span>
          </div>

          {/* Interactive Leaflet/Google Maps Container */}
          <div className="h-[440px] w-full rounded-none border border-[#B8C9CC] overflow-hidden relative shadow-none z-0">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Bottom Left Coordinate HUD */}
            <div className="absolute bottom-3 left-3 z-[1000] px-3.5 py-2 rounded-none bg-[#0E232B]/95 backdrop-blur-md text-white text-[11px] font-mono border border-[#075A73] shadow-none flex items-center gap-3">
              <Compass className="w-3.5 h-3.5 text-[#B8C9CC]" />
              <span>{selectedTarget.lat.toFixed(6)}° N, {selectedTarget.lon.toFixed(6)}° E</span>
              <span>·</span>
              <span className="text-white font-bold">{selectedTarget.depth}m Depth</span>
            </div>
          </div>

          {/* Target Quick Selection Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
            {LIVE_TARGETS.map((t) => {
              const isSelected = t.id === selectedTargetId;
              return (
                <button
                  key={t.id}
                  onClick={() => focusOnTarget(t)}
                  className={`px-3 py-2 rounded-none border text-left shrink-0 transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#E5EDEE] border-[#075A73] shadow-none'
                      : 'bg-white border-[#B8C9CC] hover:bg-[#E5EDEE]/50'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-none ${
                      t.severity === 'critical'
                        ? 'bg-red-500'
                        : t.severity === 'high'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold text-[#0E232B] block font-mono">{t.id}</span>
                    <span className="text-[10px] text-[#526E78]">{t.depth}m · {t.vessel}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Target Geolocation & Actions (4 cols on lg) */}
        <div className="lg:col-span-4 light-saas-card p-6 flex flex-col justify-between h-full space-y-4 rounded-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#B8C9CC]">
              <div>
                <span className="text-xs font-black font-mono text-[#0E232B] block">
                  {selectedTarget.id}
                </span>
                <span className="text-xs font-bold text-[#2A434D] block mt-0.5">
                  {selectedTarget.label}
                </span>
              </div>
              <span
                className={
                  selectedTarget.severity === 'critical'
                    ? 'pill-badge-red'
                    : selectedTarget.severity === 'high'
                    ? 'pill-badge-amber'
                    : 'pill-badge-green'
                }
              >
                {selectedTarget.severity.toUpperCase()}
              </span>
            </div>

            {/* Target Telemetry Grid */}
            <div className="p-3.5 rounded-none bg-[#E5EDEE] border border-[#B8C9CC] space-y-3 text-xs">
              <span className="text-[10px] font-bold text-[#075A73] uppercase tracking-wider block">
                Target Geolocation Data
              </span>
              <div className="grid grid-cols-2 gap-3 text-[#2A434D] font-mono">
                <div>
                  <span className="text-[10px] text-[#526E78] block font-sans">LATITUDE</span>
                  <span className="font-bold text-[#0E232B] text-xs">{selectedTarget.lat.toFixed(6)}° N</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#526E78] block font-sans">LONGITUDE</span>
                  <span className="font-bold text-[#0E232B] text-xs">{selectedTarget.lon.toFixed(6)}° E</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#526E78] block font-sans">SEABED DEPTH</span>
                  <span className="font-bold text-[#0E232B] text-xs">{selectedTarget.depth} m</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#526E78] block font-sans">EST. FOOTPRINT</span>
                  <span className="font-bold text-[#0E232B] text-xs">{selectedTarget.area_m2} m²</span>
                </div>
              </div>
            </div>

            {/* Vessel & Mission Info */}
            <div className="p-3.5 rounded-none bg-[#E5EDEE] border border-[#B8C9CC] space-y-2 text-xs">
              <span className="text-[10px] font-bold text-[#075A73] uppercase tracking-wider block">
                Survey & Recovery Info
              </span>
              <div className="flex items-center justify-between">
                <span className="text-[#526E78] font-medium">Logged By:</span>
                <span className="font-bold text-[#0E232B] font-mono">{selectedTarget.vessel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#526E78] font-medium">Confidence:</span>
                <span className="font-bold text-emerald-700">{(selectedTarget.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#526E78] font-medium">Mission Status:</span>
                <span className="pill-badge-ocean text-[10px]">{selectedTarget.status}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => openInGoogleMaps(selectedTarget.lat, selectedTarget.lon)}
              className="w-full btn-pill-filter justify-center text-xs rounded-none"
              title="Open coordinate on Google Maps Web"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#075A73]" />
              <span>Open in Google Maps Web</span>
            </button>

            <button
              onClick={() => sendToWorkstation(selectedTarget)}
              className="w-full btn-primary justify-center text-xs rounded-none"
              title="Analyze target in AI Workstation"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Analyze in AI Workstation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
