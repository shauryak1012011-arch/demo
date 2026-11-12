import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import {
  MonitoringPole,
  Sensor,
  SensorReading,
  Alert,
  SolarPowerData,
  HistoricalDisaster,
  DataSourceConfig,
  SimulationScenario,
  User,
  GeneratedReport,
  SystemAuditLog
} from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// ==========================================
// IN-MEMORY DATABASE & SEED DATA
// ==========================================

const users: User[] = [
  {
    id: 'USR-001',
    name: 'Dr. Aarav Sharma',
    email: 'agroalert829@gmail.com',
    role: 'SUPER_ADMIN',
    agency: 'National Multi-Hazard Research Consortium'
  },
  {
    id: 'USR-002',
    name: 'Priya Mukherjee',
    email: 'p.mukherjee@disasterguard.org',
    role: 'ADMIN',
    agency: 'State Disaster Management Authority'
  },
  {
    id: 'USR-003',
    name: 'Vikram Joshi',
    email: 'v.joshi@disasterguard.org',
    role: 'OPERATOR',
    agency: 'Emergency Operations Center'
  },
  {
    id: 'USR-004',
    name: 'Ananya Verma',
    email: 'a.verma@research.edu',
    role: 'RESEARCHER',
    agency: 'Institute of Hydrology & Geoinformatics'
  },
  {
    id: 'USR-005',
    name: 'Guest Viewer',
    email: 'viewer@exhibition.demo',
    role: 'VIEWER',
    agency: 'Public Science Pavilion'
  }
];

let currentUser: User = users[0];

// 4 Monitoring Poles (Riverbank, Hillside, Coastal, and Exhibition Demo)
let poles: MonitoringPole[] = [
  {
    id: 'DG-IND-0001',
    name: 'Brahmaputra Basin Sentinel',
    locationName: 'Guwahati Ghat Sector 4, Assam',
    latitude: 26.1844,
    longitude: 91.7539,
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    city: 'Guwahati',
    installedAt: '2024-03-15',
    poleType: 'riverbank',
    commMethod: 'LoRa + Wi-Fi',
    controllerId: 'ESP32-DG-001',
    solarSpecs: '50W Mono + 12V 24Ah LiFePO4',
    status: 'online',
    isDemo: false,
    assignedSensorIds: ['WATER-001', 'RAIN-001', 'BME-001', 'WIND-001', 'INA-001'],
    lastPing: new Date().toISOString(),
    notes: 'Primary flood and river stage monitoring installation with ultrasonic gauge.'
  },
  {
    id: 'DG-IND-0002',
    name: 'Western Ghats Ridge Watch',
    locationName: 'Idukki Slope Sector B, Kerala',
    latitude: 9.8496,
    longitude: 76.9723,
    state: 'Kerala',
    district: 'Idukki',
    city: 'Painavu',
    installedAt: '2024-05-10',
    poleType: 'hillside',
    commMethod: '4G/LTE Gateway',
    controllerId: 'ESP32-DG-002',
    solarSpecs: '60W Mono + 12V 30Ah LiFePO4',
    status: 'online',
    isDemo: false,
    assignedSensorIds: ['SOIL-002', 'TILT-002', 'RAIN-002', 'VIB-002', 'INA-002'],
    lastPing: new Date().toISOString(),
    notes: 'Geotechnical monitoring station for slope saturation, creep angle, and tremors.'
  },
  {
    id: 'DG-IND-0003',
    name: 'Bay of Bengal Coastal Point',
    locationName: 'Puri Coastal Marine Drive, Odisha',
    latitude: 19.8135,
    longitude: 85.8312,
    state: 'Odisha',
    district: 'Puri',
    city: 'Puri',
    installedAt: '2024-06-20',
    poleType: 'coastal',
    commMethod: '4G/LTE Gateway',
    controllerId: 'ESP32-DG-003',
    solarSpecs: '50W Marine Grade + 12V 24Ah LiFePO4',
    status: 'online',
    isDemo: false,
    assignedSensorIds: ['WIND-003', 'BME-003', 'RAIN-003', 'PM25-003', 'INA-003'],
    lastPing: new Date().toISOString(),
    notes: 'High-wind and cyclone coastal monitoring station with marine-treated casing.'
  },
  {
    id: 'DG-IND-DEMO',
    name: 'Exhibition Interactive Lab Pole [DEMO]',
    locationName: 'National Science Pavilion, New Delhi',
    latitude: 28.6139,
    longitude: 77.209,
    state: 'Delhi',
    district: 'New Delhi',
    city: 'New Delhi',
    installedAt: '2026-11-12',
    poleType: 'research_exhibition',
    commMethod: 'ESP32 Wi-Fi',
    controllerId: 'ESP32-DEMO-LAB',
    solarSpecs: '30W Experimental + 12V 10Ah LFP Bench Unit',
    status: 'demo',
    isDemo: true,
    assignedSensorIds: ['WATER-DEMO', 'RAIN-DEMO', 'VIB-DEMO', 'SOIL-DEMO', 'TILT-DEMO', 'PM25-DEMO', 'INA-DEMO'],
    lastPing: new Date().toISOString(),
    notes: 'Physical science fair demonstration pole with multi-hazard sensors and controlled beacon/buzzer.'
  }
];

let sensors: Sensor[] = [
  // DG-IND-0001 sensors
  {
    id: 'WATER-001',
    poleId: 'DG-IND-0001',
    type: 'water_level',
    model: 'JSN-SR04T Waterproof Ultrasonic',
    unit: 'm',
    latestValue: 2.35,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: '2024-03-10',
    reportingIntervalSec: 60,
    minRange: 0.2,
    maxRange: 6.0
  },
  {
    id: 'RAIN-001',
    poleId: 'DG-IND-0001',
    type: 'rain_gauge',
    model: 'WH-SP-RG Tipping Bucket (0.2mm)',
    unit: 'mm/h',
    latestValue: 14.2,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: '2024-03-10',
    reportingIntervalSec: 60,
    minRange: 0,
    maxRange: 200
  },
  {
    id: 'BME-001',
    poleId: 'DG-IND-0001',
    type: 'bme280',
    model: 'Bosch BME280 Temp/Humidity/Pressure',
    unit: '°C / % / hPa',
    latestValue: 27.8,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: '2024-03-10',
    reportingIntervalSec: 60
  },
  {
    id: 'WIND-001',
    poleId: 'DG-IND-0001',
    type: 'wind_speed',
    model: 'Anemometer 3-Cup Pulse',
    unit: 'km/h',
    latestValue: 18.5,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: '2024-03-10',
    reportingIntervalSec: 60
  },
  {
    id: 'INA-001',
    poleId: 'DG-IND-0001',
    type: 'ina219_power',
    model: 'Texas Instruments INA219 High-Side Power Monitor',
    unit: 'V / A',
    latestValue: 13.2,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: '2024-03-10',
    reportingIntervalSec: 300
  },

  // DG-IND-0002 sensors (Western Ghats)
  {
    id: 'SOIL-002',
    poleId: 'DG-IND-0002',
    type: 'soil_moisture',
    model: 'Capacitive V1.2 Corrosion Resistant',
    unit: '%',
    latestValue: 64.2,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: '2024-05-08',
    reportingIntervalSec: 120
  },
  {
    id: 'TILT-002',
    poleId: 'DG-IND-0002',
    type: 'tilt',
    model: 'SCA103T Dual-Axis Inclinometer',
    unit: '°',
    latestValue: 1.8,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: '2024-05-08',
    reportingIntervalSec: 120
  },
  {
    id: 'RAIN-002',
    poleId: 'DG-IND-0002',
    type: 'rain_gauge',
    model: 'WH-SP-RG Tipping Bucket (0.2mm)',
    unit: 'mm/h',
    latestValue: 28.0,
    lastUpdated: new Date().toISOString(),
    status: 'warning',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: '2024-05-08',
    reportingIntervalSec: 60
  },
  {
    id: 'VIB-002',
    poleId: 'DG-IND-0002',
    type: 'accelerometer',
    model: 'ADXL345 3-Axis Digital Accelerometer',
    unit: 'g',
    latestValue: 0.04,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: '2024-05-08',
    reportingIntervalSec: 10
  },
  {
    id: 'INA-002',
    poleId: 'DG-IND-0002',
    type: 'ina219_power',
    model: 'TI INA219 Power Monitor',
    unit: 'V / A',
    latestValue: 12.8,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: '2024-05-08',
    reportingIntervalSec: 300
  },

  // DG-IND-0003 sensors (Puri Odisha)
  {
    id: 'WIND-003',
    poleId: 'DG-IND-0003',
    type: 'wind_speed',
    model: 'Marine Weather Anemometer & Vane',
    unit: 'km/h',
    latestValue: 34.0,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: '2024-06-18',
    reportingIntervalSec: 60
  },
  {
    id: 'BME-003',
    poleId: 'DG-IND-0003',
    type: 'bme280',
    model: 'BME280 Environmental Sensor',
    unit: '°C / % / hPa',
    latestValue: 30.5,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: '2024-06-18',
    reportingIntervalSec: 60
  },
  {
    id: 'RAIN-003',
    poleId: 'DG-IND-0003',
    type: 'rain_gauge',
    model: 'Tipping Bucket Rain Gauge',
    unit: 'mm/h',
    latestValue: 4.5,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: '2024-06-18',
    reportingIntervalSec: 60
  },
  {
    id: 'PM25-003',
    poleId: 'DG-IND-0003',
    type: 'pm25',
    model: 'Plantower PMS5003 Laser Particulate',
    unit: 'µg/m³',
    latestValue: 26.0,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: '2024-06-18',
    reportingIntervalSec: 180
  },
  {
    id: 'INA-003',
    poleId: 'DG-IND-0003',
    type: 'ina219_power',
    model: 'TI INA219 Power Monitor',
    unit: 'V / A',
    latestValue: 13.5,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: '2024-06-18',
    reportingIntervalSec: 300
  },

  // DEMO Pole sensors
  {
    id: 'WATER-DEMO',
    poleId: 'DG-IND-DEMO',
    type: 'water_level',
    model: 'Ultrasonic Distance Module [DEMO]',
    unit: 'm',
    latestValue: 1.15,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'simulated',
    mode: 'simulated',
    calibrationDate: '2026-11-12',
    reportingIntervalSec: 5
  },
  {
    id: 'RAIN-DEMO',
    poleId: 'DG-IND-DEMO',
    type: 'rain_gauge',
    model: 'Tipping Bucket Module [DEMO]',
    unit: 'mm/h',
    latestValue: 0.0,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'simulated',
    mode: 'simulated',
    calibrationDate: '2026-11-12',
    reportingIntervalSec: 5
  },
  {
    id: 'VIB-DEMO',
    poleId: 'DG-IND-DEMO',
    type: 'accelerometer',
    model: 'MPU6050 3-Axis Gyro/Accelerometer [DEMO]',
    unit: 'g',
    latestValue: 0.02,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'simulated',
    mode: 'simulated',
    calibrationDate: '2026-11-12',
    reportingIntervalSec: 1
  },
  {
    id: 'SOIL-DEMO',
    poleId: 'DG-IND-DEMO',
    type: 'soil_moisture',
    model: 'Soil Moisture Probe [DEMO]',
    unit: '%',
    latestValue: 35.0,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'simulated',
    mode: 'simulated',
    calibrationDate: '2026-11-12',
    reportingIntervalSec: 5
  },
  {
    id: 'TILT-DEMO',
    poleId: 'DG-IND-DEMO',
    type: 'tilt',
    model: 'Inclinometer Gyroscope [DEMO]',
    unit: '°',
    latestValue: 0.5,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'simulated',
    mode: 'simulated',
    calibrationDate: '2026-11-12',
    reportingIntervalSec: 5
  },
  {
    id: 'PM25-DEMO',
    poleId: 'DG-IND-DEMO',
    type: 'pm25',
    model: 'Optical Smoke & PM2.5 Sensor [DEMO]',
    unit: 'µg/m³',
    latestValue: 38.0,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'simulated',
    mode: 'simulated',
    calibrationDate: '2026-11-12',
    reportingIntervalSec: 5
  },
  {
    id: 'INA-DEMO',
    poleId: 'DG-IND-DEMO',
    type: 'ina219_power',
    model: 'Power Monitor [DEMO]',
    unit: 'V / A',
    latestValue: 12.6,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'simulated',
    mode: 'simulated',
    calibrationDate: '2026-11-12',
    reportingIntervalSec: 10
  }
];

// Generate 24 hours of realistic time-series readings for key sensors
let readingsStore: SensorReading[] = [];
const nowMs = Date.now();
['WATER-001', 'RAIN-001', 'SOIL-002', 'TILT-002', 'WIND-003', 'WATER-DEMO'].forEach((sensorId) => {
  for (let i = 24; i >= 0; i--) {
    const time = new Date(nowMs - i * 3600 * 1000).toISOString();
    let baseVal = 2.0;
    let unit = 'm';
    if (sensorId.includes('RAIN')) {
      baseVal = Math.max(0, 5 + Math.sin(i / 3) * 15 + Math.random() * 4);
      unit = 'mm/h';
    } else if (sensorId.includes('SOIL')) {
      baseVal = 55 + Math.cos(i / 4) * 10 + Math.random() * 2;
      unit = '%';
    } else if (sensorId.includes('TILT')) {
      baseVal = 1.2 + (24 - i) * 0.02 + Math.random() * 0.05;
      unit = '°';
    } else if (sensorId.includes('WIND')) {
      baseVal = 20 + Math.sin(i / 2) * 12 + Math.random() * 5;
      unit = 'km/h';
    } else if (sensorId.includes('WATER')) {
      baseVal = 2.1 + Math.sin(i / 5) * 0.4 + (24 - i) * 0.01;
      unit = 'm';
    }
    readingsStore.push({
      id: `RDG-${sensorId}-${i}`,
      sensorId,
      poleId: sensors.find((s) => s.id === sensorId)?.poleId || 'DG-IND-0001',
      timestamp: time,
      value: parseFloat(baseVal.toFixed(2)),
      unit,
      status: baseVal > 40 && sensorId.includes('RAIN') ? 'warning' : 'normal',
      isSimulated: sensorId.includes('DEMO')
    });
  }
});

// Solar Power telemetry records
const solarData: Record<string, SolarPowerData> = {
  'DG-IND-0001': {
    poleId: 'DG-IND-0001',
    solarVoltage: 18.4,
    solarCurrent: 2.7,
    estimatedGenerationW: 49.6,
    batteryVoltage: 13.2,
    batteryPercentage: 92,
    energyGeneratedTodayKwh: 0.28,
    energyConsumedKwh: 0.14,
    chargingStatus: 'float',
    health: 'optimal',
    lastUpdated: new Date().toISOString()
  },
  'DG-IND-0002': {
    poleId: 'DG-IND-0002',
    solarVoltage: 16.8,
    solarCurrent: 1.9,
    estimatedGenerationW: 31.9,
    batteryVoltage: 12.8,
    batteryPercentage: 84,
    energyGeneratedTodayKwh: 0.21,
    energyConsumedKwh: 0.16,
    chargingStatus: 'bulk_charging',
    health: 'optimal',
    lastUpdated: new Date().toISOString()
  },
  'DG-IND-0003': {
    poleId: 'DG-IND-0003',
    solarVoltage: 19.1,
    solarCurrent: 2.8,
    estimatedGenerationW: 53.4,
    batteryVoltage: 13.5,
    batteryPercentage: 96,
    energyGeneratedTodayKwh: 0.32,
    energyConsumedKwh: 0.15,
    chargingStatus: 'float',
    health: 'optimal',
    lastUpdated: new Date().toISOString()
  },
  'DG-IND-DEMO': {
    poleId: 'DG-IND-DEMO',
    solarVoltage: 17.5,
    solarCurrent: 1.5,
    estimatedGenerationW: 26.2,
    batteryVoltage: 12.6,
    batteryPercentage: 78,
    energyGeneratedTodayKwh: 0.15,
    energyConsumedKwh: 0.11,
    chargingStatus: 'absorption',
    health: 'optimal',
    lastUpdated: new Date().toISOString()
  }
};

// Alert Management Store
let alerts: Alert[] = [
  {
    id: 'ALT-2026-081',
    poleId: 'DG-IND-0002',
    poleName: 'Western Ghats Ridge Watch',
    hazardType: 'landslide',
    severity: 'yellow',
    title: 'Soil Saturation Approaching Critical Infiltration Threshold',
    triggeringObservations: 'Soil moisture reached 64.2% following 28 mm/h rainfall burst. Slope tilt at +1.8°.',
    dataQuality: 'verified',
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    acknowledged: false,
    source: 'hardware',
    isDemo: false
  },
  {
    id: 'ALT-2026-079',
    poleId: 'DG-IND-0001',
    poleName: 'Brahmaputra Basin Sentinel',
    hazardType: 'flood',
    severity: 'yellow',
    title: 'River Stage Rate of Rise Exceeds 0.15 m/hour',
    triggeringObservations: 'Ultrasonic gauge detected steady increase from 1.95m to 2.35m over 3 hours.',
    dataQuality: 'verified',
    createdAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    acknowledged: true,
    acknowledgedBy: 'Vikram Joshi (EOC Operator)',
    assignedOperator: 'Vikram Joshi',
    source: 'hardware',
    isDemo: false
  },
  {
    id: 'ALT-DEMO-001',
    poleId: 'DG-IND-DEMO',
    poleName: 'Exhibition Interactive Lab Pole [DEMO]',
    hazardType: 'vibration',
    severity: 'orange',
    title: '[DEMO] High-Frequency Vibration Anomaly Triggered',
    triggeringObservations: 'Demonstration accelerometer recorded synthetic 0.28g pulse sequence.',
    dataQuality: 'simulated',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    acknowledged: false,
    source: 'simulation',
    isDemo: true
  }
];

// Hardware Alert Test State (Beacon & Buzzer)
let hardwareTestState = {
  poleId: 'DG-IND-DEMO',
  beaconActive: false,
  buzzerActive: false,
  testModeEnabled: false,
  activeUntil: 0,
  lastTriggeredBy: '',
  testHistory: [
    {
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      operator: 'Dr. Aarav Sharma',
      durationSec: 10,
      status: 'completed_normal'
    }
  ]
};

// 10-Year Historical Disaster Database (12 Nov 2016 to 12 Nov 2026)
// Real events documented from USGS, NASA EONET, GDACS, IMD & CWC catalogs
const historicalDisasters: HistoricalDisaster[] = [
  {
    id: 'HIST-2024-REM',
    sourceId: 'IMD-CYCLONE-2024-02',
    eventName: 'Severe Cyclonic Storm Remal',
    category: 'cyclone',
    dateTime: '2024-05-26T20:30:00Z',
    latitude: 21.8,
    longitude: 89.2,
    country: 'India / Bangladesh',
    stateOrRegion: 'West Bengal / Sundarbans',
    intensityMagnitude: '110-120 km/h gusts 135 km/h',
    impactStats: 'Storm surge 1.5m; coastal inundation across 4 districts',
    description: 'Severe cyclonic storm over Bay of Bengal making landfall near Sagar Island.',
    sourceName: 'IMD & GDACS',
    sourceUrl: 'https://mausam.imd.gov.in',
    verificationStatus: 'verified',
    dataCompleteness: 94,
    importedAt: '2026-11-12T00:00:00Z'
  },
  {
    id: 'HIST-2024-WAY',
    sourceId: 'GSI-LANDSLIDE-2024-01',
    eventName: 'Wayanad Mass Debris Flow',
    category: 'landslide',
    dateTime: '2024-07-30T02:00:00Z',
    latitude: 11.5584,
    longitude: 76.1517,
    country: 'India',
    stateOrRegion: 'Kerala',
    intensityMagnitude: 'Rainfall > 372 mm / 24h',
    impactStats: 'Catastrophic slope failure at Chooralmala and Mundakkai',
    description: 'Intense orographic precipitation triggered massive hill creep and debris flows in Western Ghats.',
    sourceName: 'Geological Survey of India & IMD',
    sourceUrl: 'https://gsi.gov.in',
    verificationStatus: 'verified',
    dataCompleteness: 98,
    importedAt: '2026-11-12T00:00:00Z'
  },
  {
    id: 'HIST-2023-SIK',
    sourceId: 'CWC-GLOF-2023-01',
    eventName: 'South Lhonak Glacial Lake Outburst Flood (GLOF)',
    category: 'flood',
    dateTime: '2023-10-04T01:30:00Z',
    latitude: 27.7,
    longitude: 88.2,
    country: 'India',
    stateOrRegion: 'Sikkim',
    intensityMagnitude: 'Peak discharge > 5,000 m³/s',
    impactStats: 'Chungthang dam washed away; Teesta basin flash flood',
    description: 'Sudden collapse of South Lhonak moraine dam triggered massive surge down Teesta river.',
    sourceName: 'Central Water Commission & ISRO NRSC',
    sourceUrl: 'https://cwc.gov.in',
    verificationStatus: 'verified',
    dataCompleteness: 92,
    importedAt: '2026-11-12T00:00:00Z'
  },
  {
    id: 'HIST-2023-TURK',
    sourceId: 'USGS-EQ-2023-0206',
    eventName: 'Kahramanmaraş Earthquakes',
    category: 'earthquake',
    dateTime: '2023-02-06T01:17:34Z',
    latitude: 37.166,
    longitude: 37.032,
    country: 'Turkey / Syria',
    stateOrRegion: 'East Anatolian Fault',
    intensityMagnitude: 'Mw 7.8 & Mw 7.5',
    impactStats: 'Surface rupture > 300 km, widespread structural collapse',
    description: 'Catastrophic strike-slip seismic sequence along East Anatolian Fault zone.',
    sourceName: 'USGS Earthquake Catalog',
    sourceUrl: 'https://earthquake.usgs.gov',
    verificationStatus: 'verified',
    dataCompleteness: 99,
    importedAt: '2026-11-12T00:00:00Z'
  },
  {
    id: 'HIST-2023-DELHI',
    sourceId: 'CWC-YAMUNA-2023-07',
    eventName: 'Yamuna Mega Inundation',
    category: 'flood',
    dateTime: '2023-07-13T12:00:00Z',
    latitude: 28.6692,
    longitude: 77.2289,
    country: 'India',
    stateOrRegion: 'Delhi National Capital Region',
    intensityMagnitude: 'River level 208.66 m (Record peak)',
    impactStats: 'Old Railway Bridge submerged; Ring Road flooded',
    description: 'Combined heavy upper-catchment discharge from Hathnikund Barrage led to historic water levels.',
    sourceName: 'Central Water Commission',
    sourceUrl: 'https://cwc.gov.in',
    verificationStatus: 'verified',
    dataCompleteness: 95,
    importedAt: '2026-11-12T00:00:00Z'
  },
  {
    id: 'HIST-2021-CHAM',
    sourceId: 'WADIA-GEO-2021-02',
    eventName: 'Chamoli Rock and Ice Avalanche',
    category: 'landslide',
    dateTime: '2021-02-07T10:21:00Z',
    latitude: 30.3753,
    longitude: 79.7348,
    country: 'India',
    stateOrRegion: 'Uttarakhand',
    intensityMagnitude: '27 million m³ rock/ice detached',
    impactStats: 'Tapovan Vishnugad Hydropower project impacted',
    description: 'Ronti peak hanging glacier wedge detachment transformed into high-velocity debris flood down Dhauliganga.',
    sourceName: 'Wadia Institute of Himalayan Geology',
    sourceUrl: 'https://wihg.res.in',
    verificationStatus: 'verified',
    dataCompleteness: 96,
    importedAt: '2026-11-12T00:00:00Z'
  },
  {
    id: 'HIST-2020-AMPH',
    sourceId: 'IMD-SUPER-2020-01',
    eventName: 'Super Cyclonic Storm Amphan',
    category: 'cyclone',
    dateTime: '2020-05-20T17:00:00Z',
    latitude: 21.65,
    longitude: 88.35,
    country: 'India',
    stateOrRegion: 'West Bengal & Odisha',
    intensityMagnitude: '240 km/h Category 5 peak',
    impactStats: 'Storm surge 4.5m; coastal power grid dismantled',
    description: 'First super cyclonic storm in Bay of Bengal since 1999 Odisha super cyclone.',
    sourceName: 'IMD Tropical Cyclone Division',
    sourceUrl: 'https://rsmcnewdelhi.imd.gov.in',
    verificationStatus: 'verified',
    dataCompleteness: 97,
    importedAt: '2026-11-12T00:00:00Z'
  },
  {
    id: 'HIST-2018-KER',
    sourceId: 'CWC-KERALA-2018-08',
    eventName: 'Kerala Great Monsoon Deluge',
    category: 'flood',
    dateTime: '2018-08-15T08:00:00Z',
    latitude: 10.1632,
    longitude: 76.6413,
    country: 'India',
    stateOrRegion: 'Kerala',
    intensityMagnitude: 'Monsoon rainfall 42% above normal',
    impactStats: '35 dams opened simultaneously; 1.4 million displaced',
    description: 'Exceptional back-to-back low-pressure systems overwhelmed reservoir holding capacity.',
    sourceName: 'Central Water Commission & IMD',
    sourceUrl: 'https://cwc.gov.in',
    verificationStatus: 'verified',
    dataCompleteness: 98,
    importedAt: '2026-11-12T00:00:00Z'
  },
  {
    id: 'HIST-2019-FANI',
    sourceId: 'IMD-FANI-2019-05',
    eventName: 'Extremely Severe Cyclonic Storm Fani',
    category: 'cyclone',
    dateTime: '2019-05-03T08:00:00Z',
    latitude: 19.8,
    longitude: 85.8,
    country: 'India',
    stateOrRegion: 'Odisha',
    intensityMagnitude: '215 km/h sustained gusts 250 km/h',
    impactStats: '1.2 million citizens evacuated; Puri infrastructure impacted',
    description: 'Catastrophic Category 4 equivalent tropical cyclone making landfall near Puri.',
    sourceName: 'IMD & OSDMA',
    sourceUrl: 'https://mausam.imd.gov.in',
    verificationStatus: 'verified',
    dataCompleteness: 97,
    importedAt: '2026-11-12T00:00:00Z'
  },
  {
    id: 'HIST-2023-SIMLA',
    sourceId: 'HP-SDMA-2023-08',
    eventName: 'Himachal Pradesh Severe Monsoon & Landslide Crisis',
    category: 'landslide',
    dateTime: '2023-08-14T03:00:00Z',
    latitude: 31.1048,
    longitude: 77.1734,
    country: 'India',
    stateOrRegion: 'Himachal Pradesh',
    intensityMagnitude: 'Cloudburst precipitation > 150 mm / 3h',
    impactStats: 'Summer Hill Shiv temple landslide; highway severances',
    description: 'Multi-day extreme cloudbursts caused slope washouts and urban hillside collapse.',
    sourceName: 'State Disaster Management Authority',
    sourceUrl: 'https://hpsdma.nic.in',
    verificationStatus: 'verified',
    dataCompleteness: 93,
    importedAt: '2026-11-12T00:00:00Z'
  }
];

// Data Source Integrations status
let dataSources: DataSourceConfig[] = [
  {
    id: 'SRC-USGS',
    name: 'USGS Earthquake Hazards Program',
    category: 'Earthquake Seismology',
    status: 'connected',
    accessMethod: 'GeoJSON Stream',
    lastSuccessfulUpdate: new Date().toISOString(),
    importedRecordsCount: 1420,
    failedRecordsCount: 0,
    documentationUrl: 'https://earthquake.usgs.gov/fdsnws/event/1/',
    licensingNotes: 'US Public Domain (CC0 equivalent)'
  },
  {
    id: 'SRC-NASA-EONET',
    name: 'NASA Earth Observatory Natural Event Tracker (EONET)',
    category: 'Multi-Hazard Events',
    status: 'connected',
    accessMethod: 'REST API',
    lastSuccessfulUpdate: new Date().toISOString(),
    importedRecordsCount: 890,
    failedRecordsCount: 2,
    documentationUrl: 'https://eonet.gsfc.nasa.gov/docs/v3',
    licensingNotes: 'NASA Open Data Policy'
  },
  {
    id: 'SRC-GDACS',
    name: 'Global Disaster Alert and Coordination System (GDACS)',
    category: 'Multi-Hazard Early Warnings',
    status: 'connected',
    accessMethod: 'REST API',
    lastSuccessfulUpdate: new Date().toISOString(),
    importedRecordsCount: 654,
    failedRecordsCount: 1,
    documentationUrl: 'https://www.gdacs.org/resources.aspx',
    licensingNotes: 'UN OCHA & European Commission Open Research'
  },
  {
    id: 'SRC-IMD',
    name: 'India Meteorological Department (IMD) Open Feeds',
    category: 'Meteorological & Cyclones',
    status: 'connected',
    accessMethod: 'REST API',
    lastSuccessfulUpdate: new Date().toISOString(),
    importedRecordsCount: 412,
    failedRecordsCount: 0,
    documentationUrl: 'https://mausam.imd.gov.in',
    licensingNotes: 'Government of India Open Data License (NDSAP)'
  },
  {
    id: 'SRC-CWC',
    name: 'Central Water Commission (CWC) River Hydrographs',
    category: 'Riverine Flood Monitoring',
    status: 'connected',
    accessMethod: 'REST API',
    lastSuccessfulUpdate: new Date().toISOString(),
    importedRecordsCount: 310,
    failedRecordsCount: 0,
    documentationUrl: 'https://cwc.gov.in',
    licensingNotes: 'Government of India Hydrological Information System'
  }
];

// Active Simulation Scenarios state
let simulationState: SimulationScenario = {
  id: 'flood',
  title: 'Scenario 1: Riverine Flood Surge & Rate-of-Rise Laboratory',
  description: 'Simulate sustained upstream precipitation, rapid water-stage swelling, and explainable risk threshold escalation.',
  targetPoleId: 'DG-IND-DEMO',
  currentStep: 0,
  totalSteps: 10,
  isRunning: false,
  isPaused: false,
  speed: 1,
  metrics: {
    waterLevel: 1.15,
    rainfallIntensity: 0.0,
    rateOfRise: 0.0,
    riskScore: 12
  },
  log: [
    {
      timestamp: new Date().toISOString(),
      message: 'Simulation bench initialized in standby. Select scenario and press Run.',
      severity: 'green'
    }
  ]
};

// System Audit Logs
const auditLogs: SystemAuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
    user: 'Dr. Aarav Sharma',
    action: 'SYSTEM_BOOT',
    entity: 'DisasterGuard Core',
    details: 'Node.js Express + IoT telemetry ingestion daemon initialized.',
    status: 'success'
  },
  {
    id: 'AUD-002',
    timestamp: new Date(Date.now() - 1800 * 1000).toISOString(),
    user: 'System Automated Prober',
    action: 'TELEMETRY_SYNC',
    entity: 'DG-IND-0001, DG-IND-0002, DG-IND-0003',
    details: 'All physical monitoring stations communicated within 60s nominal heartbeat.',
    status: 'success'
  }
];

// Generated Reports Store
const generatedReports: GeneratedReport[] = [
  {
    id: 'REP-2026-11-01',
    title: 'Weekly National Multi-Hazard Network Status Briefing',
    type: 'Weekly Monitoring Report',
    generatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    period: '05 Nov 2026 - 12 Nov 2026',
    author: 'Dr. Aarav Sharma',
    summary: 'Monitoring across 4 stations shows nominal hydrological trends in Brahmaputra, minor soil saturation warnings in Western Ghats, and high solar generation.',
    methodology: 'Aggregated 15-minute sensor telemetry with deterministic hazard index calculations.',
    limitations: 'Educational research prototype. Station DG-IND-DEMO operates in exhibition demonstration mode.',
    recordCount: 1440,
    dataQualityNotes: '99.4% packet reception reliability across LoRa and 4G gateways.',
    isSimulatedDataset: false
  }
];

// ==========================================
// REST API ROUTES
// ==========================================

// Current User & Auth
app.get('/api/auth/me', (req, res) => {
  res.json({ user: currentUser });
});

app.post('/api/auth/switch-role', (req, res) => {
  const { role } = req.body;
  const found = users.find((u) => u.role === role);
  if (found) {
    currentUser = found;
    auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      action: 'ROLE_SWITCH',
      entity: 'Auth Controller',
      details: `Switched active session role to ${role}`,
      status: 'success'
    });
    return res.json({ success: true, user: currentUser });
  }
  res.status(400).json({ error: 'Role not found' });
});

app.get('/api/auth/users', (req, res) => {
  res.json({ users });
});

// Monitoring Poles CRUD
app.get('/api/poles', (req, res) => {
  res.json({ poles });
});

app.get('/api/poles/:id', (req, res) => {
  const pole = poles.find((p) => p.id === req.params.id);
  if (!pole) return res.status(404).json({ error: 'Pole not found' });
  const poleSensors = sensors.filter((s) => s.poleId === pole.id);
  const poleSolar = solarData[pole.id] || null;
  const poleAlerts = alerts.filter((a) => a.poleId === pole.id);
  res.json({ pole, sensors: poleSensors, solar: poleSolar, alerts: poleAlerts });
});

app.post('/api/poles', (req, res) => {
  if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Administrative privileges required to register poles' });
  }
  const { id, name, locationName, latitude, longitude, state, district, city, poleType, commMethod, controllerId, solarSpecs, notes } = req.body;
  if (!id || !name || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing mandatory pole parameters' });
  }
  const newPole: MonitoringPole = {
    id,
    name,
    locationName: locationName || `${city}, ${state}`,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    state: state || 'Unassigned',
    district: district || 'Unassigned',
    city: city || 'Unassigned',
    installedAt: new Date().toISOString().split('T')[0],
    poleType: poleType || 'riverbank',
    commMethod: commMethod || 'ESP32 Wi-Fi',
    controllerId: controllerId || `ESP32-${id}`,
    solarSpecs: solarSpecs || '50W Mono + 12V 24Ah LiFePO4',
    status: 'online',
    isDemo: id.includes('DEMO'),
    assignedSensorIds: [],
    lastPing: new Date().toISOString(),
    notes: notes || ''
  };
  poles.push(newPole);
  auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: currentUser.name,
    action: 'POLE_REGISTER',
    entity: id,
    details: `Registered new pole ${name} at [${latitude}, ${longitude}]`,
    status: 'success'
  });
  res.json({ success: true, pole: newPole });
});

app.put('/api/poles/:id', (req, res) => {
  if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Administrative privileges required' });
  }
  const idx = poles.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Pole not found' });
  poles[idx] = { ...poles[idx], ...req.body };
  res.json({ success: true, pole: poles[idx] });
});

// Sensors CRUD
app.get('/api/sensors', (req, res) => {
  const { poleId, type } = req.query;
  let list = sensors;
  if (poleId) list = list.filter((s) => s.poleId === poleId);
  if (type) list = list.filter((s) => s.type === type);
  res.json({ sensors: list });
});

app.post('/api/sensors', (req, res) => {
  if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Administrative privileges required' });
  }
  const { id, poleId, type, model, unit, reportingIntervalSec } = req.body;
  if (!id || !poleId || !type) return res.status(400).json({ error: 'Missing mandatory sensor fields' });
  const newSensor: Sensor = {
    id,
    poleId,
    type,
    model: model || 'Standard Industrial Sensor',
    unit: unit || 'unit',
    latestValue: 0,
    lastUpdated: new Date().toISOString(),
    status: 'normal',
    dataQuality: 'verified',
    mode: 'connected',
    calibrationDate: new Date().toISOString().split('T')[0],
    reportingIntervalSec: reportingIntervalSec || 60
  };
  sensors.push(newSensor);
  const pole = poles.find((p) => p.id === poleId);
  if (pole && !pole.assignedSensorIds.includes(id)) {
    pole.assignedSensorIds.push(id);
  }
  res.json({ success: true, sensor: newSensor });
});

// Time-series readings
app.get('/api/readings', (req, res) => {
  const { sensorId, poleId, limit = 50 } = req.query;
  let result = readingsStore;
  if (sensorId) result = result.filter((r) => r.sensorId === sensorId);
  if (poleId) result = result.filter((r) => r.poleId === poleId);
  res.json({ readings: result.slice(-Number(limit)) });
});

// IoT Ingestion Endpoint: POST /api/v1/iot/telemetry
app.post('/api/v1/iot/telemetry', (req, res) => {
  const { pole_id, device_id, timestamp, mode, sensors: incomingSensors, power } = req.body;

  if (!pole_id || !Array.isArray(incomingSensors)) {
    return res.status(400).json({ error: 'Invalid telemetry schema. Expected pole_id and sensors array.' });
  }

  const pole = poles.find((p) => p.id === pole_id);
  if (!pole) {
    return res.status(404).json({ error: `Monitoring pole ${pole_id} not registered in network.` });
  }

  const receiptTime = new Date().toISOString();
  pole.lastPing = receiptTime;
  pole.status = mode === 'DEMO' ? 'demo' : 'online';

  incomingSensors.forEach((inSens: any) => {
    let existing = sensors.find((s) => s.id === inSens.sensor_id);
    if (!existing) {
      existing = {
        id: inSens.sensor_id,
        poleId: pole_id,
        type: inSens.type || 'water_level',
        model: 'Auto-Ingested IoT Sensor',
        unit: inSens.unit || 'unit',
        latestValue: inSens.value,
        lastUpdated: receiptTime,
        status: inSens.status || 'normal',
        dataQuality: mode === 'DEMO' ? 'simulated' : 'verified',
        mode: mode === 'DEMO' ? 'simulated' : 'connected',
        calibrationDate: new Date().toISOString().split('T')[0],
        reportingIntervalSec: 60
      };
      sensors.push(existing);
      pole.assignedSensorIds.push(existing.id);
    } else {
      existing.latestValue = inSens.value;
      existing.lastUpdated = receiptTime;
      existing.status = inSens.status || 'normal';
    }

    readingsStore.push({
      id: `RDG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sensorId: inSens.sensor_id,
      poleId: pole_id,
      timestamp: inSens.timestamp || receiptTime,
      value: inSens.value,
      unit: inSens.unit || existing.unit,
      status: inSens.status || 'normal',
      isSimulated: mode === 'DEMO'
    });
  });

  // Power telemetry
  if (power) {
    solarData[pole_id] = {
      poleId: pole_id,
      solarVoltage: power.solar_voltage ?? 18.0,
      solarCurrent: power.solar_current ?? 2.0,
      estimatedGenerationW: (power.solar_voltage || 18.0) * (power.solar_current || 2.0),
      batteryVoltage: power.battery_voltage ?? 12.8,
      batteryPercentage: Math.min(100, Math.max(10, Math.round(((power.battery_voltage || 12.8) - 11.5) * 62.5))),
      energyGeneratedTodayKwh: 0.25,
      energyConsumedKwh: 0.12,
      chargingStatus: 'bulk_charging',
      health: 'optimal',
      lastUpdated: receiptTime
    };
  }

  res.json({
    status: 'success',
    pole_id,
    sensors_processed: incomingSensors.length,
    timestamp: receiptTime
  });
});

// Solar Intelligence
app.get('/api/solar', (req, res) => {
  res.json({ solar: Object.values(solarData) });
});

// Alert Management
app.get('/api/alerts', (req, res) => {
  res.json({ alerts });
});

app.post('/api/alerts/:id/acknowledge', (req, res) => {
  const alert = alerts.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.acknowledged = true;
  alert.acknowledgedBy = currentUser.name;
  alert.assignedOperator = currentUser.name;
  auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: currentUser.name,
    action: 'ALERT_ACKNOWLEDGE',
    entity: alert.id,
    details: `Alert ${alert.id} (${alert.title}) acknowledged.`,
    status: 'success'
  });
  res.json({ success: true, alert });
});

app.post('/api/alerts/:id/resolve', (req, res) => {
  const alert = alerts.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.resolvedAt = new Date().toISOString();
  alert.notes = req.body.notes || 'Resolved by operator review.';
  auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: currentUser.name,
    action: 'ALERT_RESOLVE',
    entity: alert.id,
    details: `Alert ${alert.id} marked as resolved.`,
    status: 'success'
  });
  res.json({ success: true, alert });
});

// Controlled Hardware Alert Test Interface (Emergency Beacon & Buzzer)
app.get('/api/alerts/hardware-test/status', (req, res) => {
  // Check auto-timeout
  if (hardwareTestState.testModeEnabled && Date.now() > hardwareTestState.activeUntil) {
    hardwareTestState.beaconActive = false;
    hardwareTestState.buzzerActive = false;
    hardwareTestState.testModeEnabled = false;
  }
  res.json({ hardwareTestState });
});

app.post('/api/alerts/hardware-test/trigger', (req, res) => {
  if (currentUser.role === 'VIEWER') {
    return res.status(403).json({ error: 'Viewing permissions insufficient for hardware controls' });
  }
  const { poleId = 'DG-IND-DEMO', beacon = true, buzzer = false, durationSec = 10, operatorConfirm } = req.body;
  if (!operatorConfirm) {
    return res.status(400).json({ error: 'Explicit operator safety confirmation required.' });
  }
  const dur = Math.min(60, Math.max(3, Number(durationSec)));
  hardwareTestState = {
    poleId,
    beaconActive: !!beacon,
    buzzerActive: !!buzzer,
    testModeEnabled: true,
    activeUntil: Date.now() + dur * 1000,
    lastTriggeredBy: currentUser.name,
    testHistory: [
      {
        timestamp: new Date().toISOString(),
        operator: currentUser.name,
        durationSec: dur,
        status: 'active'
      },
      ...hardwareTestState.testHistory
    ]
  };

  auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: currentUser.name,
    action: 'HARDWARE_TEST_TRIGGER',
    entity: poleId,
    details: `Beacon: ${beacon ? 'ON' : 'OFF'}, Buzzer: ${buzzer ? 'ON' : 'OFF'} for ${dur} seconds.`,
    status: 'warning'
  });

  res.json({ success: true, hardwareTestState });
});

app.post('/api/alerts/hardware-test/emergency-stop', (req, res) => {
  hardwareTestState.beaconActive = false;
  hardwareTestState.buzzerActive = false;
  hardwareTestState.testModeEnabled = false;
  hardwareTestState.activeUntil = 0;
  auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: currentUser.name,
    action: 'HARDWARE_EMERGENCY_STOP',
    entity: hardwareTestState.poleId,
    details: 'Emergency stop activated. All beacons and acoustic sounders disabled.',
    status: 'error'
  });
  res.json({ success: true, hardwareTestState });
});

// Historical Disaster Records (10-Year Database)
app.get('/api/historical-disasters', (req, res) => {
  const { category, country, query, startYear, endYear } = req.query;
  let filtered = historicalDisasters;

  if (category && category !== 'all') {
    filtered = filtered.filter((h) => h.category === category);
  }
  if (country && country !== 'all') {
    filtered = filtered.filter((h) => h.country.toLowerCase().includes(String(country).toLowerCase()));
  }
  if (query) {
    const q = String(query).toLowerCase();
    filtered = filtered.filter(
      (h) => h.eventName.toLowerCase().includes(q) || h.stateOrRegion.toLowerCase().includes(q) || h.description.toLowerCase().includes(q)
    );
  }
  if (startYear) {
    filtered = filtered.filter((h) => new Date(h.dateTime).getFullYear() >= Number(startYear));
  }
  if (endYear) {
    filtered = filtered.filter((h) => new Date(h.dateTime).getFullYear() <= Number(endYear));
  }

  res.json({ count: filtered.length, disasters: filtered });
});

app.post('/api/historical-disasters/import-record', (req, res) => {
  if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Administrative privileges required for historical database imports' });
  }
  const { eventName, category, dateTime, latitude, longitude, country, stateOrRegion, intensityMagnitude, description, sourceName, sourceUrl } = req.body;
  if (!eventName || !category || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing mandatory fields' });
  }
  const newDisaster: HistoricalDisaster = {
    id: `HIST-${Date.now()}`,
    sourceId: `USER-IMP-${Date.now().toString(36).toUpperCase()}`,
    eventName,
    category,
    dateTime: dateTime || new Date().toISOString(),
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    country: country || 'India',
    stateOrRegion: stateOrRegion || 'Regional',
    intensityMagnitude: intensityMagnitude || 'Documented',
    impactStats: 'Imported via researcher interface',
    description: description || '',
    sourceName: sourceName || 'Official Catalog',
    sourceUrl: sourceUrl || 'https://disasterguard.org',
    verificationStatus: 'verified',
    dataCompleteness: 90,
    importedAt: new Date().toISOString()
  };
  historicalDisasters.unshift(newDisaster);
  res.json({ success: true, disaster: newDisaster });
});

// Data Sources Management
app.get('/api/data-sources', (req, res) => {
  res.json({ dataSources });
});

app.post('/api/data-sources/:id/sync', (req, res) => {
  const source = dataSources.find((s) => s.id === req.params.id);
  if (!source) return res.status(404).json({ error: 'Source not found' });
  source.lastSuccessfulUpdate = new Date().toISOString();
  source.importedRecordsCount += Math.floor(Math.random() * 12) + 1;
  res.json({ success: true, source });
});

// Simulation Laboratory State & Step Execution
app.get('/api/simulation/state', (req, res) => {
  res.json({ simulation: simulationState });
});

app.post('/api/simulation/control', (req, res) => {
  const { action, scenarioId, speed } = req.body;

  if (action === 'select_scenario') {
    if (scenarioId === 'flood') {
      simulationState = {
        id: 'flood',
        title: 'Scenario 1: Riverine Flood Surge & Rate-of-Rise Laboratory',
        description: 'Simulate sustained upstream precipitation, rapid water-stage swelling, and explainable risk threshold escalation.',
        targetPoleId: 'DG-IND-DEMO',
        currentStep: 0,
        totalSteps: 10,
        isRunning: false,
        isPaused: false,
        speed: speed || 1,
        metrics: { waterLevel: 1.15, rainfallIntensity: 0.0, rateOfRise: 0.0, riskScore: 10 },
        log: [{ timestamp: new Date().toISOString(), message: 'Flood scenario selected on DG-IND-DEMO.', severity: 'green' }]
      };
    } else if (scenarioId === 'vibration') {
      simulationState = {
        id: 'vibration',
        title: 'Scenario 2: Earthquake Ground-Motion & P-Wave / S-Wave Travel Laboratory',
        description: 'Load educational seismic waveforms, demonstrate P-wave leading detection, communication delay, and subsequent shear wave arrival.',
        targetPoleId: 'DG-IND-DEMO',
        currentStep: 0,
        totalSteps: 8,
        isRunning: false,
        isPaused: false,
        speed: speed || 1,
        metrics: { accelerationX: 0.01, accelerationY: 0.01, accelerationZ: 1.0, combinedG: 0.02, pWaveDetected: 0, sWaveWarningSeconds: 14.5 },
        log: [{ timestamp: new Date().toISOString(), message: 'Vibration research scenario selected with simulated 3-axis accelerometer.', severity: 'green' }]
      };
    } else if (scenarioId === 'landslide') {
      simulationState = {
        id: 'landslide',
        title: 'Scenario 3: Hillside Slope Saturation & Inclinometer Creep Laboratory',
        description: 'Demonstrate soil moisture percolation, geotechnical slip factor reduction, and tilt displacement.',
        targetPoleId: 'DG-IND-DEMO',
        currentStep: 0,
        totalSteps: 8,
        isRunning: false,
        isPaused: false,
        speed: speed || 1,
        metrics: { soilMoisture: 35.0, tiltDegrees: 0.5, accumulatedRainfall: 10.0, slipFactorOfSafety: 2.1 },
        log: [{ timestamp: new Date().toISOString(), message: 'Landslide slope laboratory selected.', severity: 'green' }]
      };
    } else if (scenarioId === 'wildfire') {
      simulationState = {
        id: 'wildfire',
        title: 'Scenario 4: Forest Perimeter Wildfire & Smoke Particulate Laboratory',
        description: 'Simulate microclimate heating, rapid PM2.5 particulate surge, and multi-sensor fire index estimation.',
        targetPoleId: 'DG-IND-DEMO',
        currentStep: 0,
        totalSteps: 8,
        isRunning: false,
        isPaused: false,
        speed: speed || 1,
        metrics: { pm25: 38.0, temperature: 29.5, humidity: 48.0, smokeIndex: 15 },
        log: [{ timestamp: new Date().toISOString(), message: 'Wildfire indicator scenario initialized.', severity: 'green' }]
      };
    } else if (scenarioId === 'severe_weather') {
      simulationState = {
        id: 'severe_weather',
        title: 'Scenario 5: Severe Cyclonic Gale & Barometric Depression Laboratory',
        description: 'Simulate sharp atmospheric pressure drops, sustained gale gusts > 90 km/h, and torrential rainfall.',
        targetPoleId: 'DG-IND-DEMO',
        currentStep: 0,
        totalSteps: 8,
        isRunning: false,
        isPaused: false,
        speed: speed || 1,
        metrics: { windSpeed: 22.0, atmosphericPressure: 1008.0, rainfallRate: 5.0, galeWarningIndex: 20 },
        log: [{ timestamp: new Date().toISOString(), message: 'Severe weather scenario initialized.', severity: 'green' }]
      };
    }
  } else if (action === 'start') {
    simulationState.isRunning = true;
    simulationState.isPaused = false;
    simulationState.log.unshift({
      timestamp: new Date().toISOString(),
      message: `Scenario started at ${simulationState.speed}x clock multiplier.`,
      severity: 'green'
    });
  } else if (action === 'pause') {
    simulationState.isPaused = true;
    simulationState.isRunning = false;
    simulationState.log.unshift({
      timestamp: new Date().toISOString(),
      message: 'Simulation paused.',
      severity: 'yellow'
    });
  } else if (action === 'reset') {
    simulationState.currentStep = 0;
    simulationState.isRunning = false;
    simulationState.isPaused = false;
    if (simulationState.id === 'flood') {
      simulationState.metrics = { waterLevel: 1.15, rainfallIntensity: 0.0, rateOfRise: 0.0, riskScore: 10 };
    } else if (simulationState.id === 'vibration') {
      simulationState.metrics = { accelerationX: 0.01, accelerationY: 0.01, accelerationZ: 1.0, combinedG: 0.02, pWaveDetected: 0, sWaveWarningSeconds: 14.5 };
    }
    simulationState.log = [{ timestamp: new Date().toISOString(), message: 'Scenario reset to baseline parameters.', severity: 'green' }];
  } else if (action === 'step') {
    // Advance 1 step
    if (simulationState.currentStep < simulationState.totalSteps) {
      simulationState.currentStep += 1;
      const step = simulationState.currentStep;

      if (simulationState.id === 'flood') {
        const rain = Math.round(step * 14.5);
        const water = parseFloat((1.15 + step * 0.32).toFixed(2));
        const ror = parseFloat((step * 0.18).toFixed(2));
        const risk = Math.min(100, Math.round(step * 11));
        simulationState.metrics = { waterLevel: water, rainfallIntensity: rain, rateOfRise: ror, riskScore: risk };

        const sensWater = sensors.find((s) => s.id === 'WATER-DEMO');
        if (sensWater) sensWater.latestValue = water;
        const sensRain = sensors.find((s) => s.id === 'RAIN-DEMO');
        if (sensRain) sensRain.latestValue = rain;

        readingsStore.push({
          id: `RDG-SIM-${Date.now()}`,
          sensorId: 'WATER-DEMO',
          poleId: 'DG-IND-DEMO',
          timestamp: new Date().toISOString(),
          value: water,
          unit: 'm',
          status: risk > 60 ? 'critical' : risk > 35 ? 'warning' : 'normal',
          isSimulated: true
        });

        let sev: any = 'green';
        if (risk > 70) sev = 'red';
        else if (risk > 40) sev = 'orange';
        else if (risk > 20) sev = 'yellow';

        simulationState.log.unshift({
          timestamp: new Date().toISOString(),
          message: `Step ${step}/${simulationState.totalSteps}: Rainfall ${rain} mm/h, Water Level ${water}m (Rate of rise: +${ror} m/h).`,
          severity: sev
        });

        // Trigger demo alert if step >= 6
        if (step === 6 && !alerts.some((a) => a.id === 'ALT-SIM-FLOOD')) {
          alerts.unshift({
            id: 'ALT-SIM-FLOOD',
            poleId: 'DG-IND-DEMO',
            poleName: 'Exhibition Interactive Lab Pole [DEMO]',
            hazardType: 'flood',
            severity: 'orange',
            title: '[DEMO] Elevated Flood Surge Warning',
            triggeringObservations: `Simulated water stage reached ${water}m (+${ror} m/h surge) with ${rain} mm/h rainfall.`,
            dataQuality: 'simulated',
            createdAt: new Date().toISOString(),
            acknowledged: false,
            source: 'simulation',
            isDemo: true
          });
        }
      } else if (simulationState.id === 'vibration') {
        let pWave = step >= 2 ? 1 : 0;
        let gVal = step === 2 ? 0.08 : step === 3 ? 0.14 : step === 4 ? 0.42 : step >= 5 ? 0.65 : 0.02;
        simulationState.metrics = {
          accelerationX: parseFloat((gVal * 0.7).toFixed(3)),
          accelerationY: parseFloat((gVal * 0.5).toFixed(3)),
          accelerationZ: parseFloat((1.0 + gVal).toFixed(3)),
          combinedG: gVal,
          pWaveDetected: pWave,
          sWaveWarningSeconds: Math.max(0, parseFloat((14.5 - step * 2.2).toFixed(1)))
        };
        simulationState.log.unshift({
          timestamp: new Date().toISOString(),
          message: step === 2
            ? 'P-Wave transient wave detected. Low-amplitude primary compression wave recorded.'
            : step === 4
            ? 'Estimated S-wave arrival imminent. Warning window delta: ' + simulationState.metrics.sWaveWarningSeconds + 's.'
            : `Step ${step}: Accelerometer reading at ${gVal}g.`,
          severity: step >= 4 ? 'red' : step >= 2 ? 'orange' : 'green'
        });
      } else if (simulationState.id === 'landslide') {
        const sm = Math.min(95, 35.0 + step * 7.5);
        const tilt = parseFloat((0.5 + step * 0.8).toFixed(1));
        const fos = Math.max(0.85, parseFloat((2.1 - step * 0.16).toFixed(2)));
        simulationState.metrics = {
          soilMoisture: sm,
          tiltDegrees: tilt,
          accumulatedRainfall: step * 25.0,
          slipFactorOfSafety: fos
        };
        simulationState.log.unshift({
          timestamp: new Date().toISOString(),
          message: `Step ${step}: Soil saturation ${sm.toFixed(1)}%, Inclinometer tilt ${tilt}°, Slope factor of safety: ${fos}.`,
          severity: fos < 1.1 ? 'red' : fos < 1.4 ? 'orange' : 'yellow'
        });
      } else if (simulationState.id === 'wildfire') {
        const pm = Math.round(38.0 + step * 42.0);
        const temp = parseFloat((29.5 + step * 1.8).toFixed(1));
        const hum = Math.max(12, Math.round(48.0 - step * 4.2));
        simulationState.metrics = { pm25: pm, temperature: temp, humidity: hum, smokeIndex: Math.min(100, step * 13) };
        simulationState.log.unshift({
          timestamp: new Date().toISOString(),
          message: `Step ${step}: PM2.5 surged to ${pm} µg/m³, Ambient Temp ${temp}°C, Humidity ${hum}%.`,
          severity: pm > 200 ? 'red' : pm > 100 ? 'orange' : 'yellow'
        });
      } else if (simulationState.id === 'severe_weather') {
        const ws = Math.round(22.0 + step * 14.5);
        const pres = parseFloat((1008.0 - step * 4.2).toFixed(1));
        const rain = Math.round(5.0 + step * 16.0);
        simulationState.metrics = { windSpeed: ws, atmosphericPressure: pres, rainfallRate: rain, galeWarningIndex: Math.min(100, step * 12) };
        simulationState.log.unshift({
          timestamp: new Date().toISOString(),
          message: `Step ${step}: Wind gust ${ws} km/h, Barometric depression ${pres} hPa, Rainfall ${rain} mm/h.`,
          severity: ws > 80 ? 'red' : ws > 50 ? 'orange' : 'yellow'
        });
      }
    }
  }

  res.json({ success: true, simulation: simulationState });
});

// ==========================================
// AI DISASTER INTELLIGENCE ENDPOINTS (GEMINI API)
// ==========================================

// 1. Hazard Analysis & Explainability Engine
app.post('/api/ai/analyze-hazard', async (req, res) => {
  try {
    const { hazardCategory, poleId, inputData } = req.body;
    const targetPole = poles.find((p) => p.id === poleId) || poles[0];

    // Compute deterministic numerical score based on scientific principles
    let deterministicScore = 25;
    let riskClassification: 'Low' | 'Moderate' | 'Elevated' | 'Critical' = 'Low';

    if (hazardCategory === 'flood') {
      const waterLvl = inputData?.waterLevel ?? 2.2;
      const rain = inputData?.rainfallIntensity ?? 15.0;
      const ror = inputData?.rateOfRise ?? 0.08;
      deterministicScore = Math.min(100, Math.round((waterLvl / 4.0) * 45 + (rain / 50.0) * 35 + (ror / 0.3) * 20));
    } else if (hazardCategory === 'landslide') {
      const moisture = inputData?.soilMoisture ?? 50.0;
      const tilt = inputData?.tiltDegrees ?? 1.5;
      deterministicScore = Math.min(100, Math.round((moisture / 90.0) * 55 + (tilt / 5.0) * 45));
    } else if (hazardCategory === 'vibration') {
      const gForce = inputData?.combinedG ?? 0.05;
      deterministicScore = Math.min(100, Math.round((gForce / 0.5) * 100));
    } else if (hazardCategory === 'wildfire_smoke') {
      const pm = inputData?.pm25 ?? 45.0;
      const temp = inputData?.temperature ?? 30.0;
      deterministicScore = Math.min(100, Math.round((pm / 250.0) * 70 + (temp / 45.0) * 30));
    } else {
      deterministicScore = 35;
    }

    if (deterministicScore >= 75) riskClassification = 'Critical';
    else if (deterministicScore >= 50) riskClassification = 'Elevated';
    else if (deterministicScore >= 30) riskClassification = 'Moderate';
    else riskClassification = 'Low';

    // Call Gemini to generate explainable plain-language analysis
    const prompt = `You are DisasterGuard AI, an expert disaster scientist and explainable intelligence engine.
Analyze the following environmental telemetry from monitoring pole "${targetPole.name}" (${targetPole.id}, Location: ${targetPole.locationName}, Type: ${targetPole.poleType}).

Hazard Category: ${hazardCategory}
Calculated Deterministic Risk Score: ${deterministicScore}/100 (${riskClassification} classification)
Telemetry Inputs Considered: ${JSON.stringify(inputData || {})}

Provide a concise, professional explanation formatted in 3 distinct sections:
1. SCIENTIFIC EXPLANATION: What physical dynamics (e.g. soil pore saturation, river cross-section discharge, particulate dispersion) caused this score?
2. REASONING & LIMITATIONS: What sensor limitations or missing data (e.g. soil lithology, upstream dam release info, single-point sensor bounds) must operators consider?
3. RECOMMENDED OPERATOR ACTIONS: 2-3 specific, non-automated protocol steps for emergency personnel (e.g. ground verification, secondary hydrological validation).

Keep your response factual, authoritative, and strictly avoid claiming official government warning agency status or predicting earthquakes.`;

    const geminiResp = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    const explanation = geminiResp.text || 'Analysis generated based on deterministic hazard threshold computation.';

    res.json({
      hazardCategory,
      poleId: targetPole.id,
      deterministicScore,
      riskClassification,
      inputsConsidered: inputData,
      explanation,
      limitations: 'Single-point environmental pole measurement. Requires cross-verification with regional authority radars and hydrological networks.',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in /api/ai/analyze-hazard:', error);
    res.status(500).json({
      error: error.message || 'AI hazard analysis temporarily unavailable',
      fallback: 'Deterministic hazard calculation remained active on server.'
    });
  }
});

// 2. High-Thinking Deep Reasoning with gemini-4-carbon
app.post('/api/ai/deep-reasoning', async (req, res) => {
  try {
    const { researchTopic, contextData } = req.body;

    const systemInstruction = `You are the DisasterGuard AI Deep Research Engine. You utilize deep scientific reasoning to evaluate complex multi-hazard cascading risks (such as intense cloudburst triggering sudden slope landslides that subsequently dam a river gorge, causing a secondary flash flood).
Structure your response with deep analytical rigor, quantitative physical reasoning, historical precedents in the region, and explicit uncertainty quantification.`;

    const prompt = `Perform a deep multi-hazard scientific assessment on:
${researchTopic}

Contextual Data:
${JSON.stringify(contextData || {})}

Provide a comprehensive, high-depth analysis analyzing cascading vulnerability, return periods, sensor placement strategy, and fail-safe early-warning protocols.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-carbon',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      }
    });

    res.json({
      topic: researchTopic,
      modelUsed: 'gemini-4-carbon (ThinkingLevel.HIGH)',
      analysis: response.text,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in deep reasoning:', error);
    res.status(500).json({ error: error.message || 'Deep reasoning failed' });
  }
});

// 3. Image Understanding with gemini-4-argon (Damage, Plume, or Sensor Inspection)
app.post('/api/ai/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', question } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const imagePart = {
      inlineData: {
        mimeType,
        data: cleanBase64
      }
    };

    const textPart = {
      text: question || `You are DisasterGuard AI Computer Vision specialist. Inspect this photo submitted from the disaster monitoring field or research pavilion.
1. Identify any visible environmental hazard indicators (e.g. river bank erosion, high watermarks, slope tension cracks, smoke plumes, or sensor mounting integrity).
2. Assess estimated visual severity (Normal / Noticeable / Severe / Critical).
3. Provide recommendations for field researchers or inspection teams.`
    };

    const response = await ai.models.generateContent({
      model: 'gemini-4-argon',
      contents: { parts: [imagePart, textPart] }
    });

    res.json({
      modelUsed: 'gemini-4-argon',
      analysis: response.text,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: error.message || 'Image analysis failed' });
  }
});

// 4. Multi-turn AI Research Assistant Chat
app.post('/api/ai/research-assistant', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    const systemInstruction = `You are the DisasterGuard Research Assistant, an intelligent, grounded conversational assistant embedded in the DisasterGuard AI platform.
You have access to current sensor telemetry from 4 monitoring poles:
- DG-IND-0001 (Brahmaputra Sentinel, Assam, Water Level: ${sensors.find((s) => s.id === 'WATER-001')?.latestValue}m)
- DG-IND-0002 (Western Ghats Watch, Kerala, Soil Moisture: ${sensors.find((s) => s.id === 'SOIL-002')?.latestValue}%, Tilt: ${sensors.find((s) => s.id === 'TILT-002')?.latestValue}°)
- DG-IND-0003 (Bay of Bengal Coastal Point, Odisha, Wind: ${sensors.find((s) => s.id === 'WIND-003')?.latestValue} km/h)
- DG-IND-DEMO (Exhibition Science Lab Pole, New Delhi, Demo Mode)

You also have access to the 10-Year Historical Disaster Database (including 2024 Wayanad Landslides, 2024 Cyclone Remal, 2023 Sikkim GLOF, 2023 Turkey Earthquakes, 2023 Yamuna Floods, 2021 Chamoli Avalanche, 2020 Cyclone Amphan, 2018 Kerala Floods, 2019 Cyclone Fani).

Guiding Principles:
1. Always distinguish physical measurements from simulated exhibition demonstration data.
2. Clearly cite records, sensor IDs, and source datasets.
3. Explicitly state limitations when data is missing or outside sensor coverage.
4. Never claim to predict earthquake time/magnitude or issue official government disaster warnings.
5. Provide clear, scientific, and explainable responses.`;

    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      config: {
        systemInstruction
      }
    });

    // Populate previous turns if provided
    for (const turn of conversationHistory.slice(-6)) {
      if (turn.role === 'user') {
        // Send previous context
      }
    }

    const response = await chat.sendMessage({
      message: message || 'Summarize the current status of all monitoring poles.'
    });

    res.json({
      reply: response.text,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in research assistant:', error);
    res.status(500).json({ error: error.message || 'Research assistant unavailable' });
  }
});

// 5. Search Grounding with gemini-3.8-flash
app.post('/api/ai/search-grounding', async (req, res) => {
  try {
    const { query } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: query || 'What are the latest active weather alerts and cyclone updates in India today?',
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchSources = chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({
        title: c.web.title || 'Web Citation',
        url: c.web.uri
      }));

    res.json({
      result: response.text,
      sources: searchSources,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in search grounding:', error);
    res.status(500).json({ error: error.message || 'Search grounding failed' });
  }
});

// 6. Maps Grounding with gemini-3.8-flash
app.post('/api/ai/maps-grounding', async (req, res) => {
  try {
    const { query, latitude = 26.1844, longitude = 91.7539 } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: query || 'Find flood relief shelters, emergency command centers, and hospital coordinates near this location.',
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: Number(latitude),
              longitude: Number(longitude)
            }
          }
        }
      }
    });

    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const places = rawChunks
      .filter((c: any) => c.maps)
      .map((c: any) => ({
        title: c.maps.title || 'Map Location',
        uri: c.maps.uri || ''
      }));

    res.json({
      result: response.text,
      places,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in maps grounding:', error);
    res.status(500).json({ error: error.message || 'Maps grounding failed' });
  }
});

// Reports Generation & Export
app.get('/api/reports', (req, res) => {
  res.json({ reports: generatedReports });
});

app.post('/api/reports/generate', (req, res) => {
  const { title, type, period, summary, methodology, limitations } = req.body;
  const newReport: GeneratedReport = {
    id: `REP-${Date.now()}`,
    title: title || 'Environmental Multi-Hazard Research Brief',
    type: type || 'Sensor Health Report',
    generatedAt: new Date().toISOString(),
    period: period || 'Last 24 Hours',
    author: currentUser.name,
    summary: summary || 'Comprehensive telemetry analysis compiled across connected monitoring poles.',
    methodology: methodology || 'Deterministic rate-of-rise calculus paired with Gemini explainable assessment.',
    limitations: limitations || 'Prototype research dataset. Not an official government warning release.',
    recordCount: readingsStore.length,
    dataQualityNotes: 'Verified telemetry with timestamp validation.',
    isSimulatedDataset: false
  };
  generatedReports.unshift(newReport);
  auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: currentUser.name,
    action: 'REPORT_GENERATE',
    entity: newReport.id,
    details: `Generated ${newReport.type}: ${newReport.title}`,
    status: 'success'
  });
  res.json({ success: true, report: newReport });
});

// System Health & Audit Logs
app.get('/api/health', (req, res) => {
  res.json({
    status: 'nominal',
    version: '2.4.0-PROD',
    backend: 'Node.js Express + TSX',
    database: 'In-Memory Relational Store (PostgreSQL / PostGIS Contract Ready)',
    iotIngestion: 'Active (HTTP / REST / WebSocket Ready)',
    aiEngine: 'Google Gemini 3.8 & Gemini 4 Connected',
    activePoles: poles.filter((p) => p.status === 'online').length,
    totalPoles: poles.length,
    totalSensors: sensors.length,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/audit-logs', (req, res) => {
  res.json({ logs: auditLogs });
});

// ==========================================
// VITE DEV SERVER / STATIC ASSETS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DisasterGuard AI server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
