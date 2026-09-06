export type TargetStatus = 'Neutral' | 'Critical' | 'High Risk' | 'Moderate' | 'Low Risk';

export interface SonarTarget {
  id: string;
  code: string;
  lat: string | number;
  lon: string | number;
  depth: string;
  confidence: number;
  area: string;
  type: string;
  status: TargetStatus;
  timestamp: string;
  telemetry?: {
    mmsi: string;
    estWeight: string;
    detectionSource: string;
    lastDetected: string;
    firstDetected: string;
    currentSpeed: string;
    heading: string;
    notes: string;
  };
}

export const MOCK_TARGETS: SonarTarget[] = [
  {
    id: '1',
    code: 'GN-0482',
    lat: "48.2415",
    lon: "-124.7088",
    depth: '-142.8m',
    confidence: 0.964,
    area: '34.5m x 12.0m',
    type: 'Monofilament Gillnet',
    status: 'Critical',
    timestamp: '2026-09-06 12:44:02 UTC',
    telemetry: {
      mmsi: 'N/A (Ghost Net)',
      estWeight: '450 kg',
      detectionSource: 'Sonar & Optical Fusion',
      lastDetected: '2026-09-06 14:35:22 UTC',
      firstDetected: '2026-09-05 23:10:45 UTC',
      currentSpeed: '0.2 kts (Drifting)',
      heading: '210° (SSW)',
      notes: 'Massive entanglement risk. Correlated with missing gear report from CFV-OceanStar.'
    }
  },
  {
    id: '2',
    code: 'AIS-3567',
    lat: "48.2510",
    lon: "-124.7150",
    depth: 'Surface',
    confidence: 0.99,
    area: '185m x 28m',
    type: 'Cargo Vessel',
    status: 'Neutral',
    timestamp: '2026-09-06 12:41:19 UTC',
    telemetry: {
      mmsi: '356789012',
      estWeight: '35,000 GT',
      detectionSource: 'AIS',
      lastDetected: '2026-09-06 14:35:22 UTC',
      firstDetected: '2026-09-05 23:10:45 UTC',
      currentSpeed: '12.5 kts',
      heading: '045° (NE)',
      notes: 'Standard transit vessel. AIS broadcasting nominally.'
    }
  },
  {
    id: '3',
    code: 'DARK-01',
    lat: "48.2390",
    lon: "-124.7250",
    depth: 'Surface',
    confidence: 0.887,
    area: '45.2m x 12.4m',
    type: 'Unmatched Target',
    status: 'High Risk',
    timestamp: '2026-09-06 12:38:55 UTC',
    telemetry: {
      mmsi: 'N/A (AIS Not Broadcasting)',
      estWeight: 'Unknown',
      detectionSource: 'Optical & SAR Fusion',
      lastDetected: '2026-09-06 14:35:22 UTC',
      firstDetected: '2026-09-06 10:10:45 UTC',
      currentSpeed: '4.5 kts',
      heading: '120° (SE)',
      notes: 'Vessel operating without AIS in restricted zone. RF signals detected in vicinity correlate with vessel position. Unusual loitering pattern observed.'
    }
  }
];

export interface Mission {
  id: string;
  code: string;
  length: string;
  type: string;
  distance: string;
  stops: number;
  progress: number;
  locations: number;
  waterSampling: number;
  status: 'Active' | 'Inactive';
}

export const MOCK_MISSIONS: Mission[] = [
  {
    id: '1',
    code: 'Fleet 2001',
    length: '25 Meter',
    type: 'Survey Vessel',
    distance: '225 Nm',
    stops: 10,
    progress: 22,
    locations: 3,
    waterSampling: 10,
    status: 'Active'
  },
  {
    id: '2',
    code: 'Fleet 2002',
    length: '25 Meter',
    type: 'Survey Vessel',
    distance: '225 Nm',
    stops: 10,
    progress: 22,
    locations: 3,
    waterSampling: 10,
    status: 'Active'
  },
  {
    id: '3',
    code: 'Fleet 2004',
    length: '25 Meter',
    type: 'Survey Vessel',
    distance: '225 Nm',
    stops: 10,
    progress: 22,
    locations: 3,
    waterSampling: 10,
    status: 'Inactive'
  }
];

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  group: 'Tracks' | 'Layers' | 'Overlays' | 'Grids';
}

export const MOCK_LAYERS: MapLayer[] = [
  { id: 'l1', name: 'Vessel Track', visible: true, group: 'Tracks' },
  { id: 'l2', name: 'Sonar Coverage', visible: true, group: 'Layers' },
  { id: 'l3', name: 'Detections', visible: true, group: 'Overlays' },
  { id: 'l4', name: 'Ghost Nets', visible: true, group: 'Overlays' },
  { id: 'l5', name: 'Debris', visible: true, group: 'Overlays' },
  { id: 'l6', name: 'Hotspots', visible: true, group: 'Overlays' },
  { id: 'l7', name: 'Cleanup Route', visible: true, group: 'Tracks' },
  { id: 'l8', name: 'Bathymetry', visible: true, group: 'Layers' },
  { id: 'l9', name: 'Grid', visible: true, group: 'Grids' },
  { id: 'l10', name: 'AIS', visible: false, group: 'Overlays' },
];

export const MOCK_VESSEL = {
  name: 'Oceanis One',
  heading: 45,
  speed: '4.2 kts',
  position: { lat: 48.2415, lon: -124.7088 },
  status: 'Active Survey',
  mission: 'Fleet 2001'
};

export const MOCK_TRACK = [
  { lat: 48.2350, lon: -124.7200 },
  { lat: 48.2380, lon: -124.7150 },
  { lat: 48.2400, lon: -124.7110 },
  { lat: 48.2415, lon: -124.7088 },
];

export const MOCK_HOTSPOTS = [
  { id: 'h1', lat: 48.2450, lon: -124.7000, radius: 120, severity: 'High Risk' },
  { id: 'h2', lat: 48.2300, lon: -124.7300, radius: 180, severity: 'Critical' },
];

export const MOCK_ROUTE = [
  { id: 'wp1', num: 1, lat: 48.2450, lon: -124.7000, type: 'Extraction' },
  { id: 'wp2', num: 2, lat: 48.2480, lon: -124.6900, type: 'Transit' },
  { id: 'wp3', num: 3, lat: 48.2520, lon: -124.6850, type: 'Extraction' },
];

export interface Violation {
  id: string;
  type: string;
  timestamp: string;
  hasVideo: boolean;
}

export interface FleetVessel {
  id: string;
  name: string;
  type: string;
  status: 'Underway' | 'Moored' | 'Anchored';
  activity: 'Active' | 'Inactive';
  voyage: {
    origin: string;
    originEta: string;
    destination: string;
    destinationEta: string;
    distanceTotal: string;
    distanceRem: string;
    heading: string;
    speedSog: string;
    safeSpeed: string;
    avgSpeed: string;
  };
  vesselInfo: {
    imo: string;
    mmsi: string;
    callSign: string;
    flag: string;
    lengthBeam: string;
  };
  safetyScore: {
    score: number;
    status: 'Safe' | 'Caution' | 'Warning';
  };
  violations: Violation[];
  weather: {
    temp: string;
    condition: string;
    wind: string;
    humidity: string;
  };
}

export const MOCK_FLEET: FleetVessel[] = [
  {
    id: 'fv1',
    name: 'CAP PORT ARTHUR',
    type: 'Container ship',
    status: 'Underway',
    activity: 'Active',
    voyage: {
      origin: 'OKPO',
      originEta: '2023.05.22 17:00',
      destination: 'MAS',
      destinationEta: '2023.05.28 17:00',
      distanceTotal: '84210 nm',
      distanceRem: '1765NM rem',
      heading: '030°',
      speedSog: '19 kts',
      safeSpeed: '24 kts',
      avgSpeed: '15.5 kts'
    },
    vesselInfo: {
      imo: '9632064',
      mmsi: '219561000',
      callSign: 'OWQZ2',
      flag: 'Denmark',
      lengthBeam: '399 / 60 m'
    },
    safetyScore: {
      score: 63,
      status: 'Caution'
    },
    violations: [
      { id: 'v1', type: 'Safe Speed', timestamp: '26 May 2023, 10:13:33', hasVideo: true },
      { id: 'v2', type: 'Action to Stand-on Vessel', timestamp: '21 May 2023, 10:13:33', hasVideo: true },
      { id: 'v3', type: 'Traffic Separation Schemes', timestamp: '17 Aug 2022, 10:13:33', hasVideo: true }
    ],
    weather: {
      temp: '24°C',
      condition: 'Clear',
      wind: '12 kts',
      humidity: '54%'
    }
  },
  {
    id: 'fv2',
    name: 'CMA CGM TROCADERO',
    type: 'Container Ship',
    status: 'Underway',
    activity: 'Active',
    voyage: { origin: 'SGP', originEta: '2023.05.15', destination: 'NLR', destinationEta: '2023.05.30', distanceTotal: '6000 nm', distanceRem: '2000NM rem', heading: '145°', speedSog: '22 kts', safeSpeed: '25 kts', avgSpeed: '20 kts' },
    vesselInfo: { imo: '9839933', mmsi: '228399000', callSign: 'FMMQ', flag: 'France', lengthBeam: '400 / 61 m' },
    safetyScore: { score: 92, status: 'Safe' },
    violations: [],
    weather: { temp: '28°C', condition: 'Cloudy', wind: '8 kts', humidity: '70%' }
  },
  {
    id: 'fv3',
    name: 'HARMONY GLORY',
    type: 'Bulk Carrier',
    status: 'Moored',
    activity: 'Inactive',
    voyage: { origin: 'VQS', originEta: '2023.05.01', destination: 'VQS', destinationEta: '2023.05.01', distanceTotal: '0 nm', distanceRem: '0NM rem', heading: '000°', speedSog: '0 kts', safeSpeed: '12 kts', avgSpeed: '0 kts' },
    vesselInfo: { imo: '9586710', mmsi: '354898000', callSign: '3ELX8', flag: 'Panama', lengthBeam: '225 / 32 m' },
    safetyScore: { score: 85, status: 'Safe' },
    violations: [],
    weather: { temp: '22°C', condition: 'Rain', wind: '15 kts', humidity: '85%' }
  },
  {
    id: 'fv4',
    name: 'EAE BOX 7',
    type: 'Products tanker',
    status: 'Underway',
    activity: 'Active',
    voyage: { origin: 'DXB', originEta: '2023.05.20', destination: 'RTM', destinationEta: '2023.06.10', distanceTotal: '6500 nm', distanceRem: '4200NM rem', heading: '290°', speedSog: '14 kts', safeSpeed: '16 kts', avgSpeed: '13 kts' },
    vesselInfo: { imo: '9234567', mmsi: '477123456', callSign: 'VRXY2', flag: 'Hong Kong', lengthBeam: '183 / 32 m' },
    safetyScore: { score: 45, status: 'Warning' },
    violations: [{ id: 'v4', type: 'Restricted Visibility', timestamp: '24 May 2023, 08:00:00', hasVideo: false }],
    weather: { temp: '32°C', condition: 'Haze', wind: '5 kts', humidity: '60%' }
  }
];
