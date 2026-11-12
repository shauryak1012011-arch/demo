import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  UserCheck,
  Check,
  RotateCcw,
  Zap
} from 'lucide-react';
import { Alert, UserRole } from '../types';
import { formatDate } from '../utils/formatters';

interface AlertManagementViewProps {
  alerts: Alert[];
  userRole: UserRole;
  onRefreshAlerts: () => void;
}

export const AlertManagementView: React.FC<AlertManagementViewProps> = ({
  alerts,
  userRole,
  onRefreshAlerts
}) => {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [hardwareTest, setHardwareTest] = useState<any>(null);
  const [testDuration, setTestDuration] = useState(10);
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchHardwareStatus = async () => {
    try {
      const res = await fetch('/api/alerts/hardware-test/status');
      const data = await res.json();
      setHardwareTest(data.hardwareTestState);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHardwareStatus();
    const interval = setInterval(fetchHardwareStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await fetch(`/api/alerts/${id}/acknowledge`, { method: 'POST' });
      onRefreshAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await fetch(`/api/alerts/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: resolutionNotes || 'Resolved following operator protocol.' })
      });
      setResolvingAlertId(null);
      setResolutionNotes('');
      onRefreshAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerHardwareTest = async (beacon: boolean, buzzer: boolean) => {
    if (!operatorConfirmed) {
      alert('Please confirm safety acknowledgement checkbox first.');
      return;
    }
    try {
      await fetch('/api/alerts/hardware-test/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beacon,
          buzzer,
          durationSec: testDuration,
          operatorConfirm: true
        })
      });
      fetchHardwareStatus();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await fetch('/api/alerts/hardware-test/emergency-stop', { method: 'POST' });
      fetchHardwareStatus();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'all') return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Emergency Hardware Control Station */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
              CONTROLLED HARDWARE ALERT INTERFACE (BENCH TESTING)
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1.5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              Emergency LED Beacon &amp; Electronic Sounder Controls
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Authorised testing interface for pole alert hardware. Public warning sirens are locked by default.
            </p>
          </div>

          <button
            onClick={handleEmergencyStop}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <VolumeX className="w-4 h-4" />
            EMERGENCY ALL-STOP
          </button>
        </div>

        {/* Hardware Test Status & Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Current State */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <span className="text-slate-500 font-mono text-[10px] uppercase font-semibold block">ACTIVE TEST OUTPUT STATUS</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${hardwareTest?.beaconActive ? 'bg-amber-500 animate-ping' : 'bg-slate-300'}`} />
                <span className="font-mono text-slate-800 font-medium">Strobe Beacon: {hardwareTest?.beaconActive ? 'ACTIVE' : 'IDLE'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${hardwareTest?.buzzerActive ? 'bg-red-600 animate-ping' : 'bg-slate-300'}`} />
                <span className="font-mono text-slate-800 font-medium">Buzzer Sounder: {hardwareTest?.buzzerActive ? 'PULSING' : 'SILENT'}</span>
              </div>
            </div>
            {hardwareTest?.testModeEnabled && (
              <div className="text-[10px] text-blue-700 font-mono font-bold">
                Auto-shutoff in {Math.max(0, Math.round((hardwareTest.activeUntil - Date.now()) / 1000))}s
              </div>
            )}
          </div>

          {/* Test Duration & Safety Check */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <span className="text-slate-500 font-mono text-[10px] uppercase font-semibold block">CONFIGURED DURATION</span>
            <div className="flex items-center gap-2">
              {[5, 10, 20, 30].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setTestDuration(sec)}
                  className={`px-3 py-1 rounded text-xs font-mono font-semibold cursor-pointer ${
                    testDuration === sec
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-[11px] text-slate-700 pt-1 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={operatorConfirmed}
                onChange={(e) => setOperatorConfirmed(e.target.checked)}
                className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0"
              />
              <span>I confirm this is a supervised bench demonstration.</span>
            </label>
          </div>

          {/* Trigger Actions */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-center space-y-2">
            <button
              onClick={() => handleTriggerHardwareTest(true, false)}
              className="py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5" />
              Test Strobe Beacon Only ({testDuration}s)
            </button>
            <button
              onClick={() => handleTriggerHardwareTest(true, true)}
              className="py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Test Beacon + Sounder ({testDuration}s)
            </button>
          </div>
        </div>
      </div>

      {/* Alert Feed Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Monitoring Alert Incident Register</h3>
            <span className="text-xs font-mono text-slate-500">({filteredAlerts.length} total)</span>
          </div>

          {/* Severity Filters */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {['all', 'red', 'orange', 'yellow'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded capitalize font-medium cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Alert Cards List */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all ${
                alert.severity === 'red'
                  ? 'bg-red-50/70 border-red-200'
                  : alert.severity === 'orange'
                  ? 'bg-orange-50/70 border-orange-200'
                  : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        alert.severity === 'red'
                          ? 'bg-red-600 text-white'
                          : alert.severity === 'orange'
                          ? 'bg-orange-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      LEVEL {alert.severity.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs text-slate-500">{alert.id}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-bold text-slate-900">{alert.poleName}</span>
                    {alert.isDemo && (
                      <span className="text-[9px] font-mono font-bold px-1.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        SIMULATED
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{alert.title}</h4>
                </div>

                <div className="text-right text-[11px] font-mono text-slate-500">
                  <div>{formatDate(alert.createdAt)}</div>
                  <div className="text-blue-700 font-medium mt-0.5">Source: {alert.source}</div>
                </div>
              </div>

              <p className="text-xs text-slate-700 mb-3 bg-white/80 p-2.5 rounded border border-slate-200">
                {alert.triggeringObservations}
              </p>

              {/* Status and Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-slate-200/80">
                <div className="flex items-center gap-3">
                  {alert.acknowledged ? (
                    <span className="flex items-center gap-1.5 text-emerald-800 font-mono text-[11px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Acknowledged by {alert.acknowledgedBy || 'Operator'}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Acknowledge Incident
                    </button>
                  )}

                  {alert.resolvedAt && (
                    <span className="text-slate-500 font-mono text-[11px]">
                      Resolved @ {formatDate(alert.resolvedAt).slice(11, 19)}
                    </span>
                  )}
                </div>

                {!alert.resolvedAt && (
                  <button
                    onClick={() => setResolvingAlertId(alert.id)}
                    className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 font-medium cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>

              {/* Resolve Dialog */}
              {resolvingAlertId === alert.id && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-300 space-y-2 text-xs shadow-xs">
                  <label className="text-slate-800 font-semibold block">Operator Resolution Log Notes:</label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Document ground verification, sensor reset, or false positive reason..."
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setResolvingAlertId(null)}
                      className="px-3 py-1 bg-slate-100 text-slate-600 rounded font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded cursor-pointer shadow-2xs"
                    >
                      Submit Resolution
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
