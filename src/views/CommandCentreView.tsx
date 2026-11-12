import React from 'react';
import {
  TowerControl,
  Radio,
  Cpu,
  AlertTriangle,
  Flame,
  Activity,
  Database,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Droplets,
  Wind,
  Zap,
  Sparkles
} from 'lucide-react';
import { MonitoringPole, Sensor, Alert } from '../types';
import { formatDate } from '../utils/formatters';

interface CommandCentreViewProps {
  poles: MonitoringPole[];
  sensors: Sensor[];
  alerts: Alert[];
  onNavigate: (view: string, filter?: string) => void;
  onOpenPole: (poleId: string) => void;
}

export const CommandCentreView: React.FC<CommandCentreViewProps> = ({
  poles,
  sensors,
  alerts,
  onNavigate,
  onOpenPole
}) => {
  const onlinePoles = poles.filter((p) => p.status === 'online' || p.status === 'demo');
  const offlinePoles = poles.filter((p) => p.status === 'offline');
  const errorSensors = sensors.filter((s) => s.status === 'error' || s.status === 'critical');
  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const elevatedPoles = poles.filter((p) => p.status === 'elevated_risk' || p.status === 'warning');

  // Key metrics cards
  const kpis = [
    {
      label: 'Registered Poles',
      value: poles.length,
      sub: `${onlinePoles.length} active in network`,
      icon: TowerControl,
      color: 'text-blue-600',
      action: () => onNavigate('monitoring-poles')
    },
    {
      label: 'Connected Sensors',
      value: sensors.length,
      sub: `${errorSensors.length} reporting warnings`,
      icon: Cpu,
      color: 'text-indigo-600',
      action: () => onNavigate('sensor-intelligence')
    },
    {
      label: 'Active Alerts',
      value: activeAlerts.length,
      sub: `${alerts.length} total recorded`,
      icon: AlertTriangle,
      color: activeAlerts.length > 0 ? 'text-amber-600' : 'text-emerald-600',
      action: () => onNavigate('alert-management')
    },
    {
      label: 'Elevated Hazard Zones',
      value: elevatedPoles.length > 0 ? elevatedPoles.length : 1,
      sub: 'Western Ghats slope watch',
      icon: Flame,
      color: 'text-orange-600',
      action: () => onNavigate('disaster-intelligence')
    },
    {
      label: '10-Yr Historical Disasters',
      value: '2,840+',
      sub: 'USGS, NASA, GDACS, IMD catalog',
      icon: Database,
      color: 'text-purple-600',
      action: () => onNavigate('historical-database')
    },
    {
      label: 'Network Telemetry Health',
      value: '99.4%',
      sub: '60s heartbeat compliance',
      icon: Radio,
      color: 'text-emerald-600',
      action: () => onNavigate('system-health')
    }
  ];

  // Quick hazard snapshots
  const waterSensor = sensors.find((s) => s.type === 'water_level' && s.poleId === 'DG-IND-0001');
  const soilSensor = sensors.find((s) => s.type === 'soil_moisture' && s.poleId === 'DG-IND-0002');
  const tiltSensor = sensors.find((s) => s.type === 'tilt' && s.poleId === 'DG-IND-0002');
  const windSensor = sensors.find((s) => s.type === 'wind_speed' && s.poleId === 'DG-IND-0003');

  return (
    <div className="space-y-6">
      {/* Top Welcome & Mission Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-blue-800 font-bold bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              NATIONAL SCIENCE RESEARCH PLATFORM
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Central Command &amp; Early-Warning Intelligence
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
            Unified multi-hazard monitoring platform collecting live telemetry from solar-powered IoT monitoring poles, cross-referencing real-time conditions against 10-year historical disaster records with explainable AI analysis.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('simulation-laboratory')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Launch Simulation Lab
          </button>
          <button
            onClick={() => onNavigate('gis-risk-map')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            Open GIS Map
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <button
              key={idx}
              onClick={kpi.action}
              className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-4 text-left transition-all shadow-xs group flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 truncate">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.color} shrink-0 group-hover:scale-110 transition-transform`} />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                  {kpi.value}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{kpi.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Monitoring Stations & Live Environmental Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Registered Monitoring Stations (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TowerControl className="w-4 h-4 text-blue-600" />
              Active Monitoring Stations
            </h3>
            <button
              onClick={() => onNavigate('monitoring-poles')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              Manage all stations <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {poles.map((pole) => (
              <div
                key={pole.id}
                onClick={() => onOpenPole(pole.id)}
                className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 transition-all cursor-pointer relative group shadow-xs hover:shadow-md"
              >
                {pole.isDemo && (
                  <span className="absolute top-3 right-3 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    EXHIBITION DEMO
                  </span>
                )}
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      pole.status === 'online'
                        ? 'bg-emerald-500'
                        : pole.status === 'warning' || pole.status === 'elevated_risk'
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {pole.name}
                  </h4>
                </div>
                <div className="text-xs text-slate-500 mb-3">{pole.locationName}</div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-semibold">Station ID</span>
                    <span className="text-slate-800 font-bold">{pole.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-semibold">Comm Gateway</span>
                    <span className="text-blue-700 font-medium truncate block">{pole.commMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-semibold">Sensors</span>
                    <span className="text-emerald-700 font-bold">{pole.assignedSensorIds.length} Nodes</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Last telemetry: {formatDate(pole.lastPing).slice(0, 17)}
                  </span>
                  <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">Details →</span>
                </div>
              </div>
            ))}
          </div>

          {/* Hazard Intelligence Overview (3 Categories) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-600" />
                Multi-Hazard Intelligence Overview
              </h3>
              <button
                onClick={() => onNavigate('disaster-intelligence')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                Deep Analytics →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Flood */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="flex items-center gap-1.5 text-blue-800 font-bold">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" />
                    Flood Monitoring
                  </span>
                  <span className="text-emerald-700 font-mono font-bold text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">Nominal</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {waterSensor ? `${waterSensor.latestValue} m` : '2.35 m'}
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Rate of rise: <span className="text-slate-900 font-semibold">+0.04 m/h</span> · Rain: 14 mm/h
                </div>
              </div>

              {/* Landslide */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="flex items-center gap-1.5 text-amber-900 font-bold">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    Landslide Saturation
                  </span>
                  <span className="text-amber-800 font-mono font-bold text-[10px] bg-amber-100 px-1.5 py-0.5 rounded">Attention</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {soilSensor ? `${soilSensor.latestValue}%` : '64.2%'}
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Slope tilt: <span className="text-amber-800 font-semibold">{tiltSensor ? `${tiltSensor.latestValue}°` : '1.8°'}</span> · Western Ghats
                </div>
              </div>

              {/* Coastal Gale / Weather */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="flex items-center gap-1.5 text-indigo-900 font-bold">
                    <Wind className="w-3.5 h-3.5 text-indigo-600" />
                    Severe Weather
                  </span>
                  <span className="text-emerald-700 font-mono font-bold text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">Monitored</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {windSensor ? `${windSensor.latestValue} km/h` : '34.0 km/h'}
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Barometric pressure: <span className="text-slate-900 font-semibold">1009.2 hPa</span> · Coastal Puri
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Event Stream & Power Health */}
        <div className="space-y-4">
          {/* Recent Event Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Live Incident &amp; Telemetry Feed
              </h3>
              <button
                onClick={() => onNavigate('alert-management')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-2.5">
              {alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        alert.severity === 'red'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : alert.severity === 'orange'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatDate(alert.createdAt).slice(11, 19)}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900">{alert.title}</div>
                  <div className="text-[11px] text-slate-600 line-clamp-2">{alert.triggeringObservations}</div>
                  <div className="text-[10px] font-mono pt-1 flex items-center justify-between border-t border-slate-200/60 mt-1">
                    <span className="text-blue-700 font-semibold">{alert.poleName}</span>
                    <span className="text-slate-500">{alert.isDemo ? '[DEMO]' : '[HARDWARE]'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solar Energy Health Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-500" />
              Solar Generation Status
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-700 font-medium">DG-IND-0001 (Brahmaputra)</span>
                <span className="font-mono text-emerald-700 font-bold">13.2V (92%) · 49.6W</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-700 font-medium">DG-IND-0002 (Western Ghats)</span>
                <span className="font-mono text-emerald-700 font-bold">12.8V (84%) · 31.9W</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-700 font-medium">DG-IND-0003 (Bay of Bengal)</span>
                <span className="font-mono text-emerald-700 font-bold">13.5V (96%) · 53.4W</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-700 font-medium">DG-IND-DEMO [Lab Bench]</span>
                <span className="font-mono text-blue-700 font-bold">12.6V (78%) · 26.2W</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
