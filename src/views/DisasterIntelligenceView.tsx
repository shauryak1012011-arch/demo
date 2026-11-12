import React, { useState } from 'react';
import {
  Waves,
  Activity,
  CloudLightning,
  Mountain,
  Flame,
  Brain,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Info,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { MonitoringPole, Sensor } from '../types';

interface DisasterIntelligenceViewProps {
  poles: MonitoringPole[];
  sensors: Sensor[];
}

export const DisasterIntelligenceView: React.FC<DisasterIntelligenceViewProps> = ({
  poles,
  sensors
}) => {
  const [activeTab, setActiveTab] = useState<'flood' | 'vibration' | 'weather' | 'landslide' | 'wildfire'>('flood');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  const handleRunAiAnalysis = async (hazardCat: string, inputData: any, poleId: string) => {
    setAiAnalyzing(true);
    setAiAnalysisResult(null);
    try {
      const res = await fetch('/api/ai/analyze-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hazardCategory: hazardCat,
          poleId,
          inputData
        })
      });
      const data = await res.json();
      setAiAnalysisResult(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setAiAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hazard Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('flood');
              setAiAnalysisResult(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'flood'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Waves className="w-4 h-4" />
            Flood Intelligence
          </button>

          <button
            onClick={() => {
              setActiveTab('vibration');
              setAiAnalysisResult(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'vibration'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            Ground Vibration &amp; Seismology
          </button>

          <button
            onClick={() => {
              setActiveTab('weather');
              setAiAnalysisResult(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'weather'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CloudLightning className="w-4 h-4" />
            Severe Weather &amp; Gale
          </button>

          <button
            onClick={() => {
              setActiveTab('landslide');
              setAiAnalysisResult(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'landslide'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Mountain className="w-4 h-4" />
            Landslide Saturation &amp; Tilt
          </button>

          <button
            onClick={() => {
              setActiveTab('wildfire');
              setAiAnalysisResult(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'wildfire'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-4 h-4" />
            Wildfire &amp; Smoke Plumes
          </button>
        </div>

        <span className="text-[11px] font-mono text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded border border-blue-200 hidden md:inline">
          DETERMINISTIC FORMULAS + GEMINI EXPLAINABILITY
        </span>
      </div>

      {/* TAB 1: FLOOD INTELLIGENCE */}
      {activeTab === 'flood' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  RIVER STAGE &amp; DISCHARGE CALCULUS
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Brahmaputra Basin Hydrological Analysis (DG-IND-0001)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Correlating JSN-SR04T ultrasonic river gauge stage height with WH-SP-RG tipping bucket precipitation rate.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-mono font-semibold">WATER LEVEL STAGE</span>
                  <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">2.35 m</div>
                  <span className="text-[10px] text-emerald-700 font-medium">Baseline warning: 3.50 m</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-mono font-semibold">RATE OF RISE (Δh/Δt)</span>
                  <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums">+0.08 m/h</div>
                  <span className="text-[10px] text-slate-500">Steady surge rate</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-mono font-semibold">RAIN INTENSITY</span>
                  <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">14.2 mm/h</div>
                  <span className="text-[10px] text-slate-500">Catchment precipitation</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-mono font-semibold">DETERMINISTIC RISK</span>
                  <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">28 / 100</div>
                  <span className="text-[10px] text-emerald-700 font-bold">Low - Normal Stage</span>
                </div>
              </div>

              {/* Historical Precedent Comparison */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900 font-mono text-[11px] uppercase border-b border-slate-200 pb-1">
                  Historical Basin Benchmark Comparisons (10-Yr Record)
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>2023 Yamuna Peak (Delhi Old Bridge):</span>
                  <span className="font-mono text-red-600 font-bold">208.66 m (Record Flood Level)</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>2023 Sikkim South Lhonak GLOF:</span>
                  <span className="font-mono text-red-600 font-bold">&gt; 5,000 m³/s surge discharge</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>2018 Kerala Deluge Inundation:</span>
                  <span className="font-mono text-amber-700 font-bold">Monsoon precipitation +42% normal</span>
                </div>
              </div>
            </div>

            {/* Right: AI Explainability Trigger & Output */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-900">AI Flood Explainability Engine</h4>
                </div>
                <p className="text-xs text-slate-600">
                  Generate explainable plain-language assessment citing hydrological factors, rate of rise, and sensor limits.
                </p>

                <button
                  onClick={() =>
                    handleRunAiAnalysis(
                      'flood',
                      { waterLevel: 2.35, rainfallIntensity: 14.2, rateOfRise: 0.08 },
                      'DG-IND-0001'
                    )
                  }
                  disabled={aiAnalyzing}
                  className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {aiAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Explainable Analysis
                </button>
              </div>

              {aiAnalysisResult && (
                <div className="bg-slate-50 p-4 rounded-lg border border-blue-200 text-xs text-slate-700 space-y-2 max-h-72 overflow-y-auto">
                  <div className="flex items-center justify-between font-mono text-[10px] text-blue-700 font-bold border-b border-slate-200 pb-1">
                    <span>RISK: {aiAnalysisResult.riskClassification}</span>
                    <span>SCORE: {aiAnalysisResult.deterministicScore}/100</span>
                  </div>
                  <div className="text-slate-800 whitespace-pre-wrap leading-relaxed text-xs">
                    {aiAnalysisResult.explanation}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VIBRATION & SEISMOLOGY RESEARCH */}
      {activeTab === 'vibration' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  EDUCATIONAL GROUND-MOTION RESEARCH
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Three-Axis Acceleration &amp; Waveform Analysis
                </h3>
              </div>
              <span className="text-amber-900 font-mono text-xs flex items-center gap-1.5 bg-amber-100 px-2.5 py-1 rounded border border-amber-300 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                Educational research prototype. Does NOT predict earthquakes.
              </span>
            </div>

            {/* P-wave vs S-wave Educational Principle Banner */}
            <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl text-xs space-y-2">
              <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                Earthquake Early Warning (EEW) Principle: P-Waves vs. S-Waves
              </h4>
              <p className="text-slate-700 leading-relaxed">
                Primary compression waves (<strong>P-waves</strong>) travel fastest (~5–7 km/s) through the Earth's crust with relatively low amplitude. Shear waves (<strong>S-waves</strong>) and surface waves follow at ~3–4 km/s carrying destructive energy. Early-warning systems detect the P-wave near the epicenter and transmit electronic warning signals at light speed (~300,000 km/s), affording distant communities critical seconds of lead time.
              </p>
              <div className="text-[11px] font-mono text-amber-900 pt-1 font-medium">
                Note: A single low-cost accelerometer on an individual pole cannot reliably discern a validated earthquake from local cultural noise (heavy trucks or construction) without multi-station regional array cross-correlation.
              </div>
            </div>

            {/* 3-Axis Live Waveform Representation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-600 font-medium">X-AXIS (TRANSVERSE)</span>
                  <span className="text-blue-700 font-bold">+0.012 g</span>
                </div>
                <div className="h-20 flex items-center justify-center border-b border-slate-200 bg-white rounded">
                  <div className="w-full h-1 bg-blue-200 relative mx-4">
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-blue-600 rounded-full shadow-xs" />
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-2">Sensor: ADXL345 Digital</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-600 font-medium">Y-AXIS (LONGITUDINAL)</span>
                  <span className="text-blue-700 font-bold">-0.008 g</span>
                </div>
                <div className="h-20 flex items-center justify-center border-b border-slate-200 bg-white rounded">
                  <div className="w-full h-1 bg-blue-200 relative mx-4">
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-blue-600 rounded-full shadow-xs" />
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-2">Zero-g offset calibrated</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-600 font-medium">Z-AXIS (GRAVITY VECTOR)</span>
                  <span className="text-emerald-700 font-bold">+1.004 g</span>
                </div>
                <div className="h-20 flex items-center justify-center border-b border-slate-200 bg-white rounded">
                  <div className="w-full h-1 bg-emerald-200 relative mx-4">
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-emerald-600 rounded-full shadow-xs" />
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-2">Nominal Earth 1g gravity reference</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEATHER & SEVERE GALE */}
      {activeTab === 'weather' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                ATMOSPHERIC &amp; CYCLONIC MONITORING
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">
                Bay of Bengal Coastal Point Weather Station (DG-IND-0003, Puri)
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-xs font-mono font-medium block">WIND SPEED &amp; GUSTS</span>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">34.0 km/h</div>
                <span className="text-[10px] text-slate-500">Gust peak: 42 km/h</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-xs font-mono font-medium block">BAROMETRIC PRESSURE</span>
                <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums">1009.2 hPa</div>
                <span className="text-[10px] text-slate-500">Normal coastal pressure</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-xs font-mono font-medium block">AMBIENT TEMPERATURE</span>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">30.5 °C</div>
                <span className="text-[10px] text-slate-500">Relative humidity: 76%</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-xs font-mono font-medium block">GALE RISK INDEX</span>
                <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">18 / 100</div>
                <span className="text-[10px] text-emerald-700 font-bold">Low - Fair Weather</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LANDSLIDE SATURATION */}
      {activeTab === 'landslide' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                GEOTECHNICAL SLOPE INSTABILITY RESEARCH
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">
                Western Ghats Ridge Watch (DG-IND-0002, Idukki, Kerala)
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-xs font-mono font-medium block">SOIL MOISTURE PORE RATIO</span>
                <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">64.2%</div>
                <span className="text-[10px] text-amber-800 font-bold">Approaching threshold (70%)</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-xs font-mono font-medium block">INCLINOMETER TILT</span>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">1.8°</div>
                <span className="text-[10px] text-slate-500">Baseline angular displacement</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-xs font-mono font-medium block">BURST RAINFALL RATE</span>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">28.0 mm/h</div>
                <span className="text-[10px] text-slate-500">Orographic rainfall</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-xs font-mono font-medium block">FACTOR OF SAFETY (EST.)</span>
                <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">1.42</div>
                <span className="text-[10px] text-amber-800 font-bold">Moderate Geotechnical Alert</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">Site Limitation Disclosure:</div>
              <p className="text-slate-600">
                Single-point soil probe measurements reflect localized pore pressure at sensor burial depth (0.8m). Hillside slope stability depends on subsurface bedrock topography, joint planes, and vegetative root reinforcement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WILDFIRE & SMOKE */}
      {activeTab === 'wildfire' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                OPTICAL PARTICULATE &amp; SMOKE PLUME INDICATORS
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">
                PM2.5 Laser &amp; Thermal Detection Module
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-xs font-mono font-medium block">PM2.5 PARTICULATE</span>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">26.0 µg/m³</div>
                <span className="text-[10px] text-emerald-700 font-bold">Good Air Quality</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-xs font-mono font-medium block">TEMPERATURE TREND</span>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">30.5 °C</div>
                <span className="text-[10px] text-slate-500">Steady ambient gradient</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-xs font-mono font-medium block">RELATIVE HUMIDITY</span>
                <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums">76%</div>
                <span className="text-[10px] text-blue-700 font-medium">Moist coastal envelope</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-xs font-mono font-medium block">SMOKE ANOMALY INDEX</span>
                <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">8 / 100</div>
                <span className="text-[10px] text-emerald-700 font-bold">Zero Combustion Signature</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
