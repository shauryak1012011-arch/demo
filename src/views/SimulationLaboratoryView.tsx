import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Activity,
  Droplets,
  Mountain,
  Flame,
  CloudLightning,
  Sparkles,
  Download,
  AlertTriangle,
  Info
} from 'lucide-react';
import { SimulationScenario } from '../types';
import { formatDate } from '../utils/formatters';

interface SimulationLaboratoryViewProps {
  onRefreshTelemetry: () => void;
}

export const SimulationLaboratoryView: React.FC<SimulationLaboratoryViewProps> = ({
  onRefreshTelemetry
}) => {
  const [simulation, setSimulation] = useState<SimulationScenario | null>(null);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch simulation state
  const fetchSimState = async () => {
    try {
      const res = await fetch('/api/simulation/state');
      const data = await res.json();
      setSimulation(data.simulation);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSimState();
    const interval = setInterval(fetchSimState, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleControl = async (action: string, scenarioId?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/simulation/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, scenarioId, speed })
      });
      const data = await res.json();
      setSimulation(data.simulation);
      onRefreshTelemetry();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scenarios = [
    {
      id: 'flood',
      title: 'Scenario 1: Riverine Flood Surge',
      desc: 'Simulate catchment cloudburst, rising river cross-section, rate of rise, and early stage warning.',
      icon: Droplets,
      color: 'text-blue-600'
    },
    {
      id: 'vibration',
      title: 'Scenario 2: Earthquake P-Wave / S-Wave',
      desc: 'Demonstrate 3-axis waveform, P-wave first arrival, network transmission delay, and S-wave onset.',
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      id: 'landslide',
      title: 'Scenario 3: Slope Saturation Model',
      desc: 'Simulate capacitive pore water pressure saturation, inclinometer creep angle, and slip safety factor.',
      icon: Mountain,
      color: 'text-amber-600'
    },
    {
      id: 'wildfire',
      title: 'Scenario 4: Forest Smoke Plumes',
      desc: 'Simulate PM2.5 laser spike, microclimate heating, and optical smoke combustion signature.',
      icon: Flame,
      color: 'text-orange-600'
    },
    {
      id: 'severe_weather',
      title: 'Scenario 5: Cyclonic Gale Winds',
      desc: 'Simulate atmospheric barometric depression, gale gusts > 90 km/h, and torrential rainfall.',
      icon: CloudLightning,
      color: 'text-sky-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            SCIENCE EXHIBITION SIMULATION LABORATORY [DEMO BENCH]
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1.5 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-blue-600" />
            Interactive Multi-Hazard Demonstration Laboratory
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl mt-1">
            Demonstrate end-to-end multi-hazard monitoring without physical sensors connected. All generated readings and alerts are strictly quarantined as <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 font-mono">[DEMO]</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-semibold">
            Target Station: DG-IND-DEMO
          </span>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isSelected = simulation?.id === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => handleControl('select_scenario', sc.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
              }`}
            >
              <Icon className={`w-5 h-5 ${sc.color} mb-2`} />
              <div className="text-xs font-bold text-slate-900 mb-1">{sc.title}</div>
              <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{sc.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Main Simulation Workbench */}
      {simulation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Bench Controls & Dynamic Metrics (2 cols) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <span className="font-mono text-xs text-blue-700 uppercase font-bold">
                  ACTIVE EXPERIMENT BENCH
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{simulation.title}</h3>
              </div>

              {/* Step Counter & Progress */}
              <div className="text-right font-mono">
                <span className="text-xs text-slate-500 block">EXECUTION PROGRESS</span>
                <span className="text-sm font-bold text-blue-700">
                  Step {simulation.currentStep} / {simulation.totalSteps}
                </span>
              </div>
            </div>

            {/* Scenario Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleControl('step')}
                  disabled={simulation.currentStep >= simulation.totalSteps || loading}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  Advance 1 Step
                </button>

                <button
                  onClick={() => handleControl('reset')}
                  disabled={loading}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs rounded-lg border border-slate-200 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Baseline
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 max-w-xs mx-2">
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${(simulation.currentStep / simulation.totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Real-Time Metrics Display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(simulation.metrics).map(([key, val]) => (
                <div key={key} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] font-mono uppercase block truncate">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                    {typeof val === 'number' ? val.toFixed(2) : val}
                  </div>
                  <span className="text-[10px] text-blue-700 font-mono font-medium">Simulated Value</span>
                </div>
              ))}
            </div>

            {/* Scientific Explanation / Simulation Theory */}
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 text-xs space-y-2">
              <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-700" />
                Scenario Scientific Dynamics
              </h4>
              <p className="text-slate-700 leading-relaxed">
                {simulation.id === 'flood' &&
                  'As upstream catchment precipitation accumulates, hydrological river stages swell non-linearly. The rate of rise (Δh/Δt) is the critical early-warning parameter that differentiates steady rain from flash surge waves.'}
                {simulation.id === 'vibration' &&
                  'The educational accelerometer simulation demonstrates initial compression wave (P-wave) detection. Electronic network packets transmit the anomaly alert at light speed, providing remote areas a warning interval before slower shear waves (S-waves) arrive.'}
                {simulation.id === 'landslide' &&
                  'Prolonged orographic downpours saturate the pore spaces between soil particles, drastically reducing internal shear friction. Once the Factor of Safety drops below 1.0, slope displacement accelerates.'}
                {simulation.id === 'wildfire' &&
                  'Forest combustion produces high concentrations of microscopic PM2.5 particulates accompanied by localized ambient thermal rise and sharp humidity reduction.'}
                {simulation.id === 'severe_weather' &&
                  'Cyclonic central depressions induce steep barometric pressure gradients, driving gale-force wind velocities according to the cyclostrophic wind equation.'}
              </p>
            </div>
          </div>

          {/* Right Column: Execution Log & Alerts (1 col) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Scenario Execution Log
                </h4>
                <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-200">
                  STREAM LIVE
                </span>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {simulation.log.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500">{formatDate(item.timestamp).slice(11, 19)}</span>
                      <span
                        className={`uppercase px-1.5 py-0.5 rounded font-semibold text-[9px] ${
                          item.severity === 'red'
                            ? 'text-red-700 bg-red-100 border border-red-200'
                            : item.severity === 'orange'
                            ? 'text-orange-700 bg-orange-100 border border-orange-200'
                            : item.severity === 'yellow'
                            ? 'text-amber-800 bg-amber-100 border border-amber-200'
                            : 'text-emerald-700 bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <div className="text-slate-800 text-[11px] leading-relaxed">{item.message}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-center text-[10px] font-mono text-slate-500">
              DisasterGuard AI Exhibition Simulation Sandbox v2.4
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
