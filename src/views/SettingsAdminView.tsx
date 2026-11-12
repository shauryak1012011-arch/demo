import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  Shield,
  Sliders,
  CheckCircle2,
  Save,
  Lock,
  Globe,
  Radio
} from 'lucide-react';
import { User, UserRole } from '../types';

interface SettingsAdminViewProps {
  currentUser: User;
  onSwitchRole: (role: UserRole) => void;
}

export const SettingsAdminView: React.FC<SettingsAdminViewProps> = ({
  currentUser,
  onSwitchRole
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // System Settings State
  const [appName, setAppName] = useState('DisasterGuard AI');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST +05:30)');
  const [units, setUnits] = useState('metric');
  const [floodThreshold, setFloodThreshold] = useState(0.15); // m/h
  const [soilThreshold, setSoilThreshold] = useState(70); // %
  const [windThreshold, setWindThreshold] = useState(75); // km/h
  const [pm25Threshold, setPm25Threshold] = useState(150); // µg/m³

  useEffect(() => {
    fetch('/api/auth/users')
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []));
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-xs">
        <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          GOVERNANCE &amp; THRESHOLD CONFIGURATION
        </span>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Settings &amp; System Administration
        </h2>
        <p className="text-xs text-slate-600 max-w-3xl">
          Configure experimental multi-hazard alert thresholds, reporting frequencies, sensor unit standards, and inspect role-based access control (RBAC).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: General Settings & Alert Thresholds (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Network Parameters &amp; Alert Thresholds
              </h3>
              {saveSuccess && (
                <span className="text-emerald-700 text-xs font-mono flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Settings Applied
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Platform Name</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">System Timezone</label>
                <input
                  type="text"
                  disabled
                  value={timezone}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-500 font-mono"
                />
              </div>
            </div>

            {/* Thresholds Grid */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 font-mono uppercase text-blue-800">
                Experimental Hazard Threshold Benchmarks
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-600 block text-[11px] font-medium">Flood Rate of Rise Warning (m/h)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={floodThreshold}
                    onChange={(e) => setFloodThreshold(parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-blue-700 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500">Triggers Yellow Alert on surge rate</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-600 block text-[11px] font-medium">Soil Moisture Saturation (%)</span>
                  <input
                    type="number"
                    value={soilThreshold}
                    onChange={(e) => setSoilThreshold(parseInt(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-amber-700 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500">Hillside pore pressure threshold</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-600 block text-[11px] font-medium">Wind Gale Gust Velocity (km/h)</span>
                  <input
                    type="number"
                    value={windThreshold}
                    onChange={(e) => setWindThreshold(parseInt(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-sky-700 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500">Coastal cyclone warning trigger</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-600 block text-[11px] font-medium">PM2.5 Smoke Anomaly (µg/m³)</span>
                  <input
                    type="number"
                    value={pm25Threshold}
                    onChange={(e) => setPm25Threshold(parseInt(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-orange-700 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500">Combustion particulate marker</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Apply Parameter Updates
              </button>
            </div>
          </form>
        </div>

        {/* Right: User Roles & RBAC (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              User Roles &amp; Permissions (RBAC)
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Switch session roles to test access control enforcement across views and APIs.
            </p>
          </div>

          <div className="space-y-2.5">
            {users.map((u) => {
              const isCurrent = currentUser.id === u.id;
              return (
                <div
                  key={u.id}
                  onClick={() => onSwitchRole(u.role)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-blue-50 border-blue-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">{u.name}</span>
                    <span className="font-mono text-[10px] text-blue-700 uppercase font-semibold bg-blue-100/60 px-1.5 py-0.5 rounded">
                      {u.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">{u.agency}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">{u.email}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
