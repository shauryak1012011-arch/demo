import React, { useState } from 'react';
import {
  TowerControl,
  Plus,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Cpu,
  Zap,
  X,
  Edit,
  ShieldCheck
} from 'lucide-react';
import { MonitoringPole, Sensor, UserRole } from '../types';
import { formatDate } from '../utils/formatters';

interface MonitoringPolesViewProps {
  poles: MonitoringPole[];
  sensors: Sensor[];
  userRole: UserRole;
  onRefreshPoles: () => void;
  selectedPoleId?: string | null;
  onSelectPole: (poleId: string | null) => void;
}

export const MonitoringPolesView: React.FC<MonitoringPolesViewProps> = ({
  poles,
  sensors,
  userRole,
  onRefreshPoles,
  selectedPoleId,
  onSelectPole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Pole Form State
  const [newPole, setNewPole] = useState({
    id: `DG-IND-000${poles.length + 1}`,
    name: '',
    locationName: '',
    latitude: 25.5941,
    longitude: 85.1376,
    state: 'Bihar',
    district: 'Patna',
    city: 'Patna',
    poleType: 'riverbank' as any,
    commMethod: 'LoRa + Wi-Fi' as any,
    controllerId: `ESP32-DG-00${poles.length + 1}`,
    solarSpecs: '50W Mono + 12V 24Ah LiFePO4',
    notes: ''
  });

  const canEdit = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  const filteredPoles = poles.filter((pole) => {
    const matchesSearch =
      pole.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pole.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pole.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pole.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || pole.poleType === typeFilter;
    return matchesSearch && matchesType;
  });

  const activePole = poles.find((p) => p.id === selectedPoleId);
  const activePoleSensors = activePole ? sensors.filter((s) => s.poleId === activePole.id) : [];

  const handleCreatePole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    try {
      const res = await fetch('/api/poles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPole)
      });
      if (res.ok) {
        setShowAddModal(false);
        onRefreshPoles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportJSON = (pole: MonitoringPole) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pole, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${pole.id}_telemetry_config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search poles, districts, or IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-64 shadow-2xs"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 shadow-2xs"
          >
            <option value="all">All Topographies</option>
            <option value="riverbank">Riverbank</option>
            <option value="hillside">Hillside Slope</option>
            <option value="coastal">Coastal</option>
            <option value="urban_plain">Urban Plain</option>
            <option value="research_exhibition">Exhibition Demo</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Register Monitoring Pole
            </button>
          )}
        </div>
      </div>

      {/* Poles Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-mono font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Station ID &amp; Name</th>
                <th className="py-3 px-4">Topography</th>
                <th className="py-3 px-4">Geographic Coordinates</th>
                <th className="py-3 px-4">State &amp; District</th>
                <th className="py-3 px-4">Sensors</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPoles.map((pole) => (
                <tr
                  key={pole.id}
                  onClick={() => onSelectPole(pole.id)}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                    selectedPoleId === pole.id ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      {pole.name}
                      {pole.isDemo && (
                        <span className="text-[9px] font-mono font-bold px-1.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          DEMO
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-blue-700 font-mono font-semibold">{pole.id}</div>
                  </td>
                  <td className="py-3 px-4 font-mono capitalize text-slate-700">{pole.poleType.replace('_', ' ')}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {pole.latitude.toFixed(4)}°N, {pole.longitude.toFixed(4)}°E
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{pole.district}</div>
                    <div className="text-[10px] text-slate-500">{pole.state}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-700 font-bold">
                    {pole.assignedSensorIds.length} Nodes
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        pole.status === 'online'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : pole.status === 'demo'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {pole.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{pole.commMethod}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPole(pole.id);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 font-semibold rounded border border-slate-300 text-[11px] cursor-pointer shadow-2xs"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pole Inspection Drawer */}
      {activePole && (
        <div className="bg-white border border-blue-300 rounded-xl p-5 shadow-md space-y-4">
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-blue-700 font-bold">{activePole.id}</span>
                {activePole.isDemo && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                    EXHIBITION SCIENCE DEMO
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{activePole.name}</h3>
              <div className="text-xs text-slate-600 flex items-center gap-2 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {activePole.locationName} ({activePole.latitude}°N, {activePole.longitude}°E)
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportJSON(activePole)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export Config
              </button>
              <button
                onClick={() => onSelectPole(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Spec Card */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="font-semibold text-slate-900 font-mono text-[11px] uppercase border-b border-slate-200 pb-1">
                Hardware Architecture
              </div>
              <div>Controller: <span className="font-mono text-blue-700 font-bold">{activePole.controllerId}</span></div>
              <div>Power Unit: <span className="text-slate-800">{activePole.solarSpecs}</span></div>
              <div>Installed Date: <span className="font-mono text-slate-700">{activePole.installedAt}</span></div>
              <div>Comm System: <span className="font-mono text-emerald-700 font-bold">{activePole.commMethod}</span></div>
            </div>

            {/* Connected Sensors Card */}
            <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="font-semibold text-slate-900 font-mono text-[11px] uppercase border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Associated Sensor Modules ({activePoleSensors.length})</span>
                <span className="text-emerald-700 font-bold">All Nodes Active</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {activePoleSensors.map((s) => (
                  <div key={s.id} className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-blue-700 font-bold block">{s.id}</span>
                      <span className="font-medium text-slate-800">{s.type.replace('_', ' ')}</span>
                    </div>
                    <div className="font-mono text-right">
                      <span className="text-slate-900 font-bold">{s.latestValue}</span>
                      <span className="text-[10px] text-slate-500 ml-1">{s.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Pole Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TowerControl className="w-5 h-5 text-blue-600" />
                Register New Monitoring Station
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePole} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Station ID</label>
                  <input
                    type="text"
                    required
                    value={newPole.id}
                    onChange={(e) => setNewPole({ ...newPole, id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Station Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ganga Flood Watch"
                    value={newPole.name}
                    onChange={(e) => setNewPole({ ...newPole, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newPole.latitude}
                    onChange={(e) => setNewPole({ ...newPole, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newPole.longitude}
                    onChange={(e) => setNewPole({ ...newPole, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">State</label>
                  <input
                    type="text"
                    value={newPole.state}
                    onChange={(e) => setNewPole({ ...newPole, state: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">District</label>
                  <input
                    type="text"
                    value={newPole.district}
                    onChange={(e) => setNewPole({ ...newPole, district: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">City/Village</label>
                  <input
                    type="text"
                    value={newPole.city}
                    onChange={(e) => setNewPole({ ...newPole, city: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Topography Type</label>
                  <select
                    value={newPole.poleType}
                    onChange={(e) => setNewPole({ ...newPole, poleType: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
                  >
                    <option value="riverbank">Riverbank</option>
                    <option value="hillside">Hillside Slope</option>
                    <option value="coastal">Coastal</option>
                    <option value="urban_plain">Urban Plain</option>
                    <option value="research_exhibition">Exhibition Demo</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Communication Gateway</label>
                  <select
                    value={newPole.commMethod}
                    onChange={(e) => setNewPole({ ...newPole, commMethod: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
                  >
                    <option value="LoRa + Wi-Fi">LoRa + Wi-Fi</option>
                    <option value="4G/LTE Gateway">4G/LTE Gateway</option>
                    <option value="ESP32 Wi-Fi">ESP32 Wi-Fi</option>
                    <option value="Satellite Telemetry">Satellite Telemetry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-medium">Solar &amp; Battery System Details</label>
                <input
                  type="text"
                  value={newPole.solarSpecs}
                  onChange={(e) => setNewPole({ ...newPole, solarSpecs: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded cursor-pointer shadow-xs"
                >
                  Confirm Station Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
