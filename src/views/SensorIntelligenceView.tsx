import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Layers,
  Activity,
  Calendar,
  X
} from 'lucide-react';
import { Sensor, MonitoringPole, UserRole } from '../types';
import { formatDate } from '../utils/formatters';

interface SensorIntelligenceViewProps {
  sensors: Sensor[];
  poles: MonitoringPole[];
  userRole: UserRole;
  onRefreshSensors: () => void;
}

export const SensorIntelligenceView: React.FC<SensorIntelligenceViewProps> = ({
  sensors,
  poles,
  userRole,
  onRefreshSensors
}) => {
  const [search, setSearch] = useState('');
  const [hazardFilter, setHazardFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [showAddSensorModal, setShowAddSensorModal] = useState(false);

  const canEdit = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  // Add Sensor Form
  const [newSensor, setNewSensor] = useState({
    id: `SENS-00${sensors.length + 1}`,
    poleId: poles[0]?.id || 'DG-IND-0001',
    type: 'water_level' as any,
    model: 'JSN-SR04T Waterproof Ultrasonic',
    unit: 'm',
    reportingIntervalSec: 60
  });

  const filteredSensors = sensors.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.model.toLowerCase().includes(search.toLowerCase()) ||
      s.poleId.toLowerCase().includes(search.toLowerCase());
    const matchesMode = modeFilter === 'all' || s.mode === modeFilter;
    let matchesHazard = true;
    if (hazardFilter === 'flood') matchesHazard = s.type === 'water_level' || s.type === 'rain_gauge' || s.type === 'float_switch';
    else if (hazardFilter === 'weather') matchesHazard = s.type === 'bme280' || s.type === 'wind_speed' || s.type === 'wind_direction';
    else if (hazardFilter === 'vibration') matchesHazard = s.type === 'accelerometer';
    else if (hazardFilter === 'landslide') matchesHazard = s.type === 'soil_moisture' || s.type === 'tilt';
    else if (hazardFilter === 'smoke') matchesHazard = s.type === 'pm25';
    else if (hazardFilter === 'power') matchesHazard = s.type === 'ina219_power' || s.type === 'gps';

    return matchesSearch && matchesMode && matchesHazard;
  });

  const handleCreateSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    try {
      const res = await fetch('/api/sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSensor)
      });
      if (res.ok) {
        setShowAddSensorModal(false);
        onRefreshSensors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sensors, models, poles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-60 shadow-2xs"
            />
          </div>

          <select
            value={hazardFilter}
            onChange={(e) => setHazardFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 shadow-2xs"
          >
            <option value="all">All Hazard Modules</option>
            <option value="flood">Flood Sensors (Water Level, Rain)</option>
            <option value="weather">Weather (BME280, Wind)</option>
            <option value="vibration">Vibration &amp; Seismic (ADXL345)</option>
            <option value="landslide">Landslide (Soil Moisture, Tilt)</option>
            <option value="smoke">Wildfire &amp; Smoke (PM2.5)</option>
            <option value="power">Power &amp; GPS (INA219)</option>
          </select>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 shadow-2xs"
          >
            <option value="all">All Integration Modes</option>
            <option value="connected">Connected Physical Hardware</option>
            <option value="simulated">Simulated Sensor Node</option>
            <option value="unconfigured">Not Configured</option>
          </select>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddSensorModal(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Assign Sensor Node
          </button>
        )}
      </div>

      {/* Sensor Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSensors.map((sensor) => {
          const pole = poles.find((p) => p.id === sensor.poleId);
          return (
            <div
              key={sensor.id}
              className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 transition-all space-y-3 shadow-xs hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs text-blue-700 font-bold block">{sensor.id}</span>
                  <h4 className="text-sm font-bold text-slate-900 capitalize">{sensor.type.replace('_', ' ')}</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">{sensor.model}</div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                      sensor.mode === 'connected'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    {sensor.mode === 'connected' ? 'Hardware' : 'Simulated'}
                  </span>
                  <span
                    className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                      sensor.dataQuality === 'verified'
                        ? 'text-emerald-700 bg-emerald-50'
                        : sensor.dataQuality === 'degraded'
                        ? 'text-amber-800 bg-amber-50'
                        : 'text-slate-500 bg-slate-100'
                    }`}
                  >
                    Quality: {sensor.dataQuality}
                  </span>
                </div>
              </div>

              {/* Current Reading */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono font-semibold block">LATEST OBSERVATION</span>
                  <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                    {sensor.latestValue} <span className="text-xs font-normal text-slate-500">{sensor.unit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-mono font-semibold block">STATION POLE</span>
                  <span className="text-xs font-bold text-blue-700 font-mono">{sensor.poleId}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600 pt-1 border-t border-slate-100">
                <div>Interval: {sensor.reportingIntervalSec}s</div>
                <div className="text-right">Calibrated: {sensor.calibrationDate}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Sensor Modal */}
      {showAddSensorModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                Assign Sensor Module to Pole
              </h3>
              <button onClick={() => setShowAddSensorModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSensor} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-medium">Target Monitoring Pole</label>
                <select
                  value={newSensor.poleId}
                  onChange={(e) => setNewSensor({ ...newSensor, poleId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-900"
                >
                  {poles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Sensor ID</label>
                  <input
                    type="text"
                    required
                    value={newSensor.id}
                    onChange={(e) => setNewSensor({ ...newSensor, id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Hazard Category Type</label>
                  <select
                    value={newSensor.type}
                    onChange={(e) => setNewSensor({ ...newSensor, type: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
                  >
                    <option value="water_level">Water Level (Ultrasonic)</option>
                    <option value="rain_gauge">Tipping Bucket Rain Gauge</option>
                    <option value="bme280">BME280 Weather Sensor</option>
                    <option value="wind_speed">Wind Speed Anemometer</option>
                    <option value="soil_moisture">Capacitive Soil Moisture</option>
                    <option value="tilt">Tilt / Inclinometer</option>
                    <option value="accelerometer">ADXL345 Accelerometer</option>
                    <option value="pm25">PM2.5 Particulate Sensor</option>
                    <option value="ina219_power">INA219 Power Monitor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-medium">Sensor Hardware Model</label>
                <input
                  type="text"
                  required
                  value={newSensor.model}
                  onChange={(e) => setNewSensor({ ...newSensor, model: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Measurement Unit</label>
                  <input
                    type="text"
                    required
                    value={newSensor.unit}
                    onChange={(e) => setNewSensor({ ...newSensor, unit: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Sampling Interval (sec)</label>
                  <input
                    type="number"
                    min="1"
                    max="3600"
                    value={newSensor.reportingIntervalSec}
                    onChange={(e) => setNewSensor({ ...newSensor, reportingIntervalSec: parseInt(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddSensorModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded cursor-pointer shadow-xs"
                >
                  Save Sensor Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
