import React, { useState, useEffect } from 'react';
import {
  Share2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  FileCheck
} from 'lucide-react';
import { DataSourceConfig, UserRole } from '../types';
import { formatDate } from '../utils/formatters';

interface DataSourcesViewProps {
  userRole: UserRole;
}

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({ userRole }) => {
  const [sources, setSources] = useState<DataSourceConfig[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/data-sources');
      const data = await res.json();
      setSources(data.dataSources || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleSyncSource = async (id: string) => {
    setSyncingId(id);
    try {
      await fetch(`/api/data-sources/${id}/sync`, { method: 'POST' });
      fetchSources();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-xs">
        <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          AUTHORIZED EXTERNAL INTEGRATIONS &amp; RESEARCH CATALOGS
        </span>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-600" />
          Data Sources &amp; Ingestion Connectors
        </h2>
        <p className="text-xs text-slate-600 max-w-3xl">
          DisasterGuard AI integrates with verified global and national scientific catalogs. Every record retains its provenance ID, original timestamp, license classification, and source URL.
        </p>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sources.map((src) => (
          <div
            key={src.id}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-xs transition-all"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{src.id}</span>
                <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  {src.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2">{src.name}</h3>
              <div className="text-[11px] text-slate-500 mt-0.5">{src.category}</div>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Access Method:</span>
                <span className="text-slate-800 font-medium">{src.accessMethod}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Imported Records:</span>
                <span className="text-blue-700 font-bold tabular-nums">{src.importedRecordsCount}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Last Sync:</span>
                <span className="text-slate-700">{formatDate(src.lastSuccessfulUpdate).slice(11, 19)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-600 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>License: {src.licensingNotes}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1 text-xs">
              <a
                href={src.documentationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 text-[11px] font-medium"
              >
                API Docs <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleSyncSource(src.id)}
                disabled={syncingId === src.id}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${syncingId === src.id ? 'animate-spin' : ''}`} />
                Sync Telemetry
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
