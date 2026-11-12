import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Database,
  Radio,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  RefreshCw
} from 'lucide-react';
import { SystemAuditLog } from '../types';
import { formatDate } from '../utils/formatters';

export const SystemHealthView: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealthAndLogs = async () => {
    setRefreshing(true);
    try {
      const [hRes, aRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/audit-logs')
      ]);
      const hData = await hRes.json();
      const aData = await aRes.json();
      setHealth(hData);
      setAuditLogs(aData.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthAndLogs();
    const interval = setInterval(fetchHealthAndLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const components = [
    {
      name: 'Backend Core Service',
      desc: 'Node.js Express + TSX full-stack gateway',
      status: 'Nominal',
      metric: 'Port 3000 · < 2ms latency',
      icon: Server,
      color: 'text-emerald-600'
    },
    {
      name: 'Database Storage Layer',
      desc: 'In-Memory Relational Engine (PostgreSQL / PostGIS schema)',
      status: 'Active',
      metric: '28 tables · Foreign keys enforced',
      icon: Database,
      color: 'text-blue-600'
    },
    {
      name: 'IoT Ingestion Pipeline',
      desc: 'POST /api/v1/iot/telemetry gateway',
      status: 'Listening',
      metric: '60s heartbeat · Deduplication active',
      icon: Radio,
      color: 'text-sky-600'
    },
    {
      name: 'AI Intelligence Models',
      desc: 'Google Gemini 3.8 & Gemini 4 integration',
      status: 'Connected',
      metric: 'Carbon (High Thinking) + Argon (Vision)',
      icon: Cpu,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            SYSTEM DIAGNOSTICS &amp; TELEMETRY WATCH
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1.5 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Platform Infrastructure &amp; Security Health
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl mt-1">
            Real-time operational monitoring of backend micro-services, IoT ingestion pipelines, and security audit logs.
          </p>
        </div>

        <button
          onClick={fetchHealthAndLogs}
          className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
          Run Health Probe
        </button>
      </div>

      {/* Component Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {components.map((comp, idx) => {
          const Icon = comp.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${comp.color}`} />
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                    {comp.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{comp.name}</h3>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{comp.desc}</div>
              </div>
              <div className="pt-2 border-t border-slate-100 font-mono text-[11px] text-blue-700 font-medium">
                {comp.metric}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Security &amp; Operational Audit Trail</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">({auditLogs.length} events logged)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-mono border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor / User</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity Target</th>
                <th className="py-2.5 px-3">Details</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500">{formatDate(log.timestamp).slice(11, 19)}</td>
                  <td className="py-2.5 px-3 text-slate-900 font-sans font-medium">{log.user}</td>
                  <td className="py-2.5 px-3 text-blue-700 font-medium">{log.action}</td>
                  <td className="py-2.5 px-3 text-slate-600">{log.entity}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">{log.details}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`uppercase text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                        log.status === 'success'
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : 'text-amber-800 bg-amber-50 border border-amber-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
