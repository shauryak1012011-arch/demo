import React, { useState, useEffect } from 'react';
import {
  Radio,
  TowerControl,
  Send,
  Droplets,
  Wind,
  Thermometer,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap
} from 'lucide-react';
import { MonitoringPole, Sensor, SensorReading } from '../types';
import { formatDate } from '../utils/formatters';

interface LiveMonitoringViewProps {
  poles: MonitoringPole[];
  sensors: Sensor[];
  onRefreshTelemetry: () => void;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
  poles,
  sensors,
  onRefreshTelemetry
}) => {
  const [selectedPoleId, setSelectedPoleId] = useState<string>(poles[0]?.id || 'DG-IND-0001');
  const [selectedSensorId, setSelectedSensorId] = useState<string>('');
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loadingReadings, setLoadingReadings] = useState(false);

  // Ingestion simulation state
  const [testValue, setTestValue] = useState<number>(2.45);
  const [sendingTest, setSendingTest] = useState(false);
  const [testResponse, setTestResponse] = useState<string>('');

  const currentPole = poles.find((p) => p.id === selectedPoleId) || poles[0];
  const poleSensors = sensors.filter((s) => s.poleId === selectedPoleId);

  useEffect(() => {
    if (poleSensors.length > 0 && !selectedSensorId) {
      setSelectedSensorId(poleSensors[0].id);
    }
  }, [selectedPoleId, poleSensors]);

  useEffect(() => {
    if (!selectedSensorId) return;
    setLoadingReadings(true);
    fetch(`/api/readings?sensorId=${selectedSensorId}&limit=30`)
      .then((r) => r.json())
      .then((data) => {
        setReadings(data.readings || []);
        setLoadingReadings(false);
      })
      .catch(() => setLoadingReadings(false));
  }, [selectedSensorId]);

  const activeSensor = sensors.find((s) => s.id === selectedSensorId);

  // Send real POST /api/v1/iot/telemetry packet
  const handleSendTestPacket = async () => {
    setSendingTest(true);
    setTestResponse('');
    try {
      const payload = {
        pole_id: selectedPoleId,
        device_id: currentPole?.controllerId || 'ESP32-DEV',
        timestamp: new Date().toISOString(),
        mode: currentPole?.isDemo ? 'DEMO' : 'LIVE',
        sensors: [
          {
            sensor_id: selectedSensorId,
            type: activeSensor?.type || 'water_level',
            value: Number(testValue),
            unit: activeSensor?.unit || 'unit',
            status: Number(testValue) > 40 ? 'warning' : 'normal'
          }
        ],
        power: {
          battery_voltage: 13.1,
          solar_voltage: 18.2,
          solar_current: 2.4
        }
      };

      const res = await fetch('/api/v1/iot/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setTestResponse(`Packet acknowledged by backend: ${JSON.stringify(data)}`);
      onRefreshTelemetry();
      const rRes = await fetch(`/api/readings?sensorId=${selectedSensorId}&limit=30`);
      const rData = await rRes.json();
      setReadings(rData.readings || []);
    } catch (e: any) {
      setTestResponse(`Error: ${e.message}`);
    } finally {
      setSendingTest(false);
    }
  };

  const vals = readings.map((r) => r.value);
  const minVal = vals.length ? Math.min(...vals) : 0;
  const maxVal = vals.length ? Math.max(...vals) : 0;
  const avgVal = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      {/* Top Station Selector Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <TowerControl className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <div className="text-xs text-slate-500 font-mono font-medium">SELECTED MONITORING STATION</div>
            <div className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
              {currentPole?.name}
              {currentPole?.isDemo && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                  DEMO MODE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Station Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
          {poles.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPoleId(p.id);
                setSelectedSensorId('');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                selectedPoleId === p.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {p.id}
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Nodes Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {poleSensors.map((sensor) => {
          const isSelected = selectedSensorId === sensor.id;
          return (
            <button
              key={sensor.id}
              onClick={() => setSelectedSensorId(sensor.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                <span className="font-bold text-blue-600">{sensor.id}</span>
                <span className={sensor.dataQuality === 'verified' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                  {sensor.dataQuality}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 truncate mb-1 capitalize">{sensor.type.replace('_', ' ')}</div>
              <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                {sensor.latestValue} <span className="text-xs font-normal text-slate-500">{sensor.unit}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Graph & Telemetry Deep View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Time Series Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="text-xs font-mono text-slate-500 font-medium">TIME-SERIES TELEMETRY STREAM</div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {activeSensor?.model} ({activeSensor?.id})
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                Min: <span className="text-blue-700 font-bold">{minVal}</span>
              </div>
              <div className="bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                Avg: <span className="text-emerald-700 font-bold">{avgVal}</span>
              </div>
              <div className="bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                Max: <span className="text-amber-700 font-bold">{maxVal}</span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart View */}
          <div className="h-64 w-full bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between relative overflow-hidden">
            {loadingReadings && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-blue-600 font-mono font-medium">
                Streaming records...
              </div>
            )}
            {!loadingReadings && readings.length === 0 && (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                No telemetry points recorded in buffer. Send sample packet below.
              </div>
            )}
            {!loadingReadings && readings.length > 0 && (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradientLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="45" x2="500" y2="45" stroke="#CBD5E1" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#CBD5E1" strokeDasharray="3 3" />
                <line x1="0" y1="135" x2="500" y2="135" stroke="#CBD5E1" strokeDasharray="3 3" />

                {/* Draw Area & Line */}
                {(() => {
                  const range = maxVal - minVal || 1;
                  const points = readings.map((r, i) => {
                    const x = (i / (readings.length - 1 || 1)) * 500;
                    const y = 160 - ((r.value - minVal) / range) * 130;
                    return `${x},${y}`;
                  });
                  const polyPoints = `0,175 ${points.join(' ')} 500,175`;
                  return (
                    <>
                      <polygon points={polyPoints} fill="url(#chartGradientLight)" />
                      <polyline points={points.join(' ')} fill="none" stroke="#2563EB" strokeWidth="2.5" />
                      {readings.map((r, i) => {
                        const x = (i / (readings.length - 1 || 1)) * 500;
                        const y = 160 - ((r.value - minVal) / range) * 130;
                        return (
                          <circle
                            key={r.id}
                            cx={x}
                            cy={y}
                            r="3.5"
                            className="fill-blue-600 stroke-white stroke-2 hover:r-5 transition-all cursor-pointer"
                          >
                            <title>{`${r.value} ${r.unit} @ ${r.timestamp}`}</title>
                          </circle>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-200">
              <span>{readings[0] ? formatDate(readings[0].timestamp).slice(11, 19) : '00:00:00'}</span>
              <span>24-Hour Observation Window</span>
              <span>{readings[readings.length - 1] ? formatDate(readings[readings.length - 1].timestamp).slice(11, 19) : 'Now'}</span>
            </div>
          </div>

          {/* Sensor Calibration & Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold">REPORTING FREQUENCY</span>
              <span className="text-slate-800 font-mono font-medium">{activeSensor?.reportingIntervalSec}s interval</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold">CALIBRATION CERTIFIED</span>
              <span className="text-slate-800 font-mono font-medium">{activeSensor?.calibrationDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold">INTEGRATION MODE</span>
              <span className="text-blue-700 font-mono font-bold uppercase">{activeSensor?.mode}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold">LAST READING RECEIVED</span>
              <span className="text-emerald-700 font-mono font-bold">{formatDate(activeSensor?.lastUpdated).slice(11, 19)}</span>
            </div>
          </div>
        </div>

        {/* Right: Real-time IoT Ingestion Sandbox (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              ESP32 FIRMWARE TEST INTERFACE
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-2">
              Inject Live Telemetry Payload
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Verify the backend <code className="text-blue-700 font-mono font-semibold">POST /api/v1/iot/telemetry</code> ingestion gateway directly.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-600 block mb-1 font-medium">Target Sensor</label>
              <input
                type="text"
                disabled
                value={`${activeSensor?.id} (${activeSensor?.type})`}
                className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-1.5 text-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-medium">
                Telemetry Value ({activeSensor?.unit})
              </label>
              <input
                type="number"
                step="0.05"
                value={testValue}
                onChange={(e) => setTestValue(parseFloat(e.target.value))}
                className="w-full bg-white border border-blue-400 rounded px-3 py-2 text-slate-900 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              onClick={handleSendTestPacket}
              disabled={sendingTest}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {sendingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send IoT Ingestion Packet
            </button>

            {testResponse && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-300 rounded text-[11px] font-mono text-emerald-900 break-all">
                {testResponse}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
