export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'RESEARCHER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agency?: string;
  avatarUrl?: string;
}

export type HazardCategory =
  | 'flood'
  | 'vibration'
  | 'severe_weather'
  | 'landslide'
  | 'wildfire_smoke'
  | 'earthquake'
  | 'cyclone'
  | 'drought'
  | 'heatwave'
  | 'tsunami';

export type PoleStatus = 'online' | 'offline' | 'elevated_risk' | 'warning' | 'demo';

export interface MonitoringPole {
  id: string; // e.g. "DG-IND-0001"
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  city: string;
  installedAt: string;
  poleType: 'coastal' | 'riverbank' | 'hillside' | 'urban_plain' | 'research_exhibition';
  commMethod: 'LoRa + Wi-Fi' | '4G/LTE Gateway' | 'ESP32 Wi-Fi' | 'Satellite Telemetry';
  controllerId: string;
  solarSpecs: string; // e.g. "50W Monocrystalline + 12V 24Ah LiFePO4"
  status: PoleStatus;
  isDemo: boolean;
  assignedSensorIds: string[];
  lastPing: string;
  notes?: string;
}

export type SensorType =
  | 'water_level'
  | 'float_switch'
  | 'rain_gauge'
  | 'bme280'
  | 'wind_speed'
  | 'wind_direction'
  | 'accelerometer'
  | 'soil_moisture'
  | 'tilt'
  | 'pm25'
  | 'gps'
  | 'ina219_power';

export type SensorMode = 'connected' | 'simulated' | 'unconfigured';
export type DataQuality = 'verified' | 'degraded' | 'missing' | 'simulated';

export interface Sensor {
  id: string; // e.g. "WATER-001"
  poleId: string;
  type: SensorType;
  model: string; // e.g. "JSN-SR04T Waterproof Ultrasonic"
  unit: string;
  latestValue: number;
  lastUpdated: string;
  status: 'normal' | 'warning' | 'critical' | 'error' | 'offline';
  dataQuality: DataQuality;
  mode: SensorMode;
  calibrationDate: string;
  reportingIntervalSec: number;
  minRange?: number;
  maxRange?: number;
}

export interface SensorReading {
  id: string;
  sensorId: string;
  poleId: string;
  timestamp: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  isSimulated?: boolean;
}

export type AlertSeverity = 'green' | 'yellow' | 'orange' | 'red';

export interface Alert {
  id: string;
  poleId: string;
  poleName: string;
  hazardType: HazardCategory | 'system';
  severity: AlertSeverity;
  title: string;
  triggeringObservations: string;
  dataQuality: DataQuality;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  assignedOperator?: string;
  resolvedAt?: string;
  notes?: string;
  source: 'hardware' | 'external' | 'simulation';
  isDemo: boolean;
}

export interface SolarPowerData {
  poleId: string;
  solarVoltage: number; // V
  solarCurrent: number; // A
  estimatedGenerationW: number; // W
  batteryVoltage: number; // V
  batteryPercentage: number; // %
  energyGeneratedTodayKwh: number;
  energyConsumedKwh: number;
  chargingStatus: 'bulk_charging' | 'absorption' | 'float' | 'discharging' | 'idle';
  health: 'optimal' | 'warning' | 'low_voltage';
  lastUpdated: string;
}

export interface HistoricalDisaster {
  id: string;
  sourceId: string;
  eventName: string;
  category: HazardCategory;
  dateTime: string;
  latitude: number;
  longitude: number;
  country: string;
  stateOrRegion: string;
  intensityMagnitude: string; // e.g. "Mw 7.8", "Cat 4 (180 km/h)", "450 mm / 24h"
  impactStats: string;
  description: string;
  sourceName: string; // USGS, NASA EONET, GDACS, IMD, CWC
  sourceUrl: string;
  verificationStatus: 'verified' | 'unverified' | 'provisional';
  dataCompleteness: number; // 0 - 100%
  importedAt: string;
}

export interface DataSourceConfig {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'idle' | 'unreachable' | 'manual_upload';
  accessMethod: 'REST API' | 'GeoJSON Stream' | 'Manual CSV/JSON' | 'WMS/WFS';
  lastSuccessfulUpdate: string;
  importedRecordsCount: number;
  failedRecordsCount: number;
  documentationUrl: string;
  licensingNotes: string;
}

export interface SimulationScenario {
  id: 'flood' | 'vibration' | 'landslide' | 'wildfire' | 'severe_weather';
  title: string;
  description: string;
  targetPoleId: string;
  currentStep: number;
  totalSteps: number;
  isRunning: boolean;
  isPaused: boolean;
  speed: number; // 1x, 2x, 5x
  metrics: Record<string, number>;
  log: Array<{ timestamp: string; message: string; severity: AlertSeverity }>;
}

export interface AIAnalysisRecord {
  id: string;
  hazardCategory: HazardCategory;
  poleId: string;
  timestamp: string;
  deterministicScore: number; // 0 - 100
  riskClassification: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
  inputsConsidered: Record<string, any>;
  explanation: string;
  recommendations: string[];
  limitations: string;
  missingDataNotes?: string;
  modelUsed: string;
}

export interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  generatedAt: string;
  period: string;
  author: string;
  summary: string;
  methodology: string;
  limitations: string;
  recordCount: number;
  dataQualityNotes: string;
  isSimulatedDataset: boolean;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  details: string;
  status: 'success' | 'warning' | 'error';
}
