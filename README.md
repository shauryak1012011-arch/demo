# DisasterGuard AI: Solar-Powered Multi-Hazard Monitoring & Early-Warning Research Network

> **Detect Early. Alert Faster. Protect Communities.**  
> *Educational Research & Science Exhibition Prototype Platform*

---

## 1. System Overview

**DisasterGuard AI** is a full-stack environmental monitoring, geospatial intelligence, and early-warning research platform. Built for national-level science exhibitions and hydrological/geotechnical research, it bridges physical solar-powered IoT monitoring poles with server-side AI analytics, deterministic risk calculi, and 10-year historical disaster catalogs.

### Key Capabilities
- **Command Centre Dashboard**: High-density operational overview with 6 top-level KPI cards, live telemetry feed, multi-hazard summary, and power status.
- **Physical Pole & Sensor Architecture**: Multi-sensor integration with ESP32 controllers, ultrasonic water-level sensors (JSN-SR04T), tipping bucket rain gauges, BME280 weather probes, 3-axis accelerometers (ADXL345), capacitive soil moisture probes, tilt inclinometers, PM2.5 optical particulate sensors, and INA219 power monitors.
- **Controlled Hardware Alert Testing**: Authorised testing interface for emergency LED beacons and electronic acoustic sounders with operator safety confirmation, auto-timeout, and an Emergency All-Stop killswitch.
- **10-Year Historical Disaster Database (2016–2026)**: Curated records covering floods, cyclones, landslides, and earthquakes from USGS, NASA EONET, GDACS, IMD, and CWC catalogs with CSV export and manual import.
- **Explainable AI Integration**: Powered by Google Gemini:
  - `gemini-3.8-flash`: Real-time hazard explainability, conversational research assistant, Google Search grounding, and Google Maps grounding.
  - `gemini-4-carbon`: Deep scientific reasoning (`ThinkingLevel.HIGH`) for complex multi-hazard cascading risks.
  - `gemini-4-argon`: Multimodal computer vision to inspect field damage photographs and sensor physical mounts.
- **Simulation Laboratory**: 5 complete scenarios (Riverine Flood Surge, Earthquake P-Wave vs S-Wave delay, Hillside Landslide Saturation, Wildfire Smoke Plumes, and Severe Cyclonic Gales) with step advancement and live telemetry updates.
- **Data Provenance & Safety**: Physical measurements and exhibition demonstration data are strictly partitioned.

---

## 2. IoT Telemetry Ingestion Contract

The platform exposes an authenticated endpoint for field microcontrollers:

```http
POST /api/v1/iot/telemetry
Content-Type: application/json
```

### Ingestion Payload Schema
```json
{
  "pole_id": "DG-IND-0001",
  "device_id": "ESP32-DG-001",
  "timestamp": "2026-11-12T10:30:00Z",
  "mode": "LIVE",
  "sensors": [
    {
      "sensor_id": "WATER-001",
      "type": "water_level",
      "value": 2.35,
      "unit": "m",
      "status": "normal"
    },
    {
      "sensor_id": "RAIN-001",
      "type": "rain_gauge",
      "value": 14.2,
      "unit": "mm/h",
      "status": "normal"
    }
  ],
  "power": {
    "battery_voltage": 13.2,
    "solar_voltage": 18.4,
    "solar_current": 2.7
  }
}
```

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Leaflet GIS mapping.
- **Backend**: Node.js Express full-stack server mounted via `server.ts` with Vite middlewares.
- **AI/ML**: Google GenAI SDK (`@google/genai`) with `gemini-3.8-flash`, `gemini-4-carbon`, and `gemini-4-argon`.
- **Database**: Relational In-Memory Store with PostGIS/PostgreSQL contract-ready schemas.

---

## 4. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run dev server (Express backend + Vite frontend on port 3000)
npm run dev

# 3. Build for production
npm run build
npm start
```
