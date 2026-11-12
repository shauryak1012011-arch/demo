import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  FileText,
  Download,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  X
} from 'lucide-react';
import { GeneratedReport, UserRole } from '../types';
import { formatDate } from '../utils/formatters';

interface AnalyticsReportsViewProps {
  userRole: UserRole;
}

export const AnalyticsReportsView: React.FC<AnalyticsReportsViewProps> = ({ userRole }) => {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [activeReport, setActiveReport] = useState<GeneratedReport | null>(null);

  // Form State
  const [reportTitle, setReportTitle] = useState('Daily Environmental Multi-Hazard Synthesis Brief');
  const [reportType, setReportType] = useState('Daily Monitoring Report');
  const [reportPeriod, setReportPeriod] = useState('Last 24 Hours');
  const [reportSummary, setReportSummary] = useState('Stationary river levels across Brahmaputra basin. Mild soil pore saturation warning logged at Western Ghats station. All solar units operating within nominal float thresholds.');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReports(data.reports || []);
      if (!activeReport && data.reports?.length > 0) {
        setActiveReport(data.reports[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reportTitle,
          type: reportType,
          period: reportPeriod,
          summary: reportSummary,
          methodology: 'Aggregated 15-minute sensor telemetry with deterministic rate-of-rise algorithms and Gemini explainable assessments.',
          limitations: 'Educational research prototype. Not an official government warning release.'
        })
      });
      if (res.ok) {
        setShowGenerateModal(false);
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadJSON = (rep: GeneratedReport) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rep, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${rep.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            INTELLIGENCE DOCUMENTATION &amp; AUDIT REPORTS
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1.5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Analytics &amp; Formal Research Reports
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl mt-1">
            Formal reports documenting multi-hazard telemetry, sensor data quality, historical comparisons, and methodology disclosures with clear data origin tracking.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Compile New Report
        </button>
      </div>

      {/* Reports Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports Index (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="font-bold text-xs text-slate-700 font-mono uppercase border-b border-slate-200 pb-2">
            Compiled Intelligence Archive ({reports.length})
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {reports.map((rep) => {
              const isSelected = activeReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setActiveReport(rep)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="font-bold text-blue-700">{rep.id}</span>
                    <span className="text-slate-500">{formatDate(rep.generatedAt).slice(0, 11)}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1 line-clamp-1">{rep.title}</h4>
                  <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{rep.summary}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Report Viewer (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
          {activeReport ? (
            <div className="space-y-5 text-xs text-slate-700">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {activeReport.id}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">·</span>
                    <span className="font-mono text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {activeReport.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{activeReport.title}</h3>
                  <div className="text-slate-500 text-xs mt-1">
                    Compiled by <span className="font-medium text-slate-700">{activeReport.author}</span> · Observation Period: {activeReport.period}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadJSON(activeReport)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download JSON
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-1.5">
                <h4 className="font-bold uppercase text-[11px] font-mono text-blue-800">
                  1. Executive Telemetry Summary
                </h4>
                <p className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed text-slate-800">
                  {activeReport.summary}
                </p>
              </div>

              {/* Methodology */}
              <div className="space-y-1.5">
                <h4 className="font-bold uppercase text-[11px] font-mono text-blue-800">
                  2. Analysis Methodology &amp; Mathematical Framework
                </h4>
                <p className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed text-slate-700">
                  {activeReport.methodology}
                </p>
              </div>

              {/* Data Quality & Limitations */}
              <div className="space-y-1.5">
                <h4 className="font-bold uppercase text-[11px] font-mono text-amber-800">
                  3. Technical Limitations &amp; Educational Research Disclosures
                </h4>
                <p className="bg-amber-50/70 p-3.5 rounded-lg border border-amber-200 leading-relaxed text-slate-700">
                  {activeReport.limitations}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-[11px] font-mono border-t border-slate-200">
                <div>Record Points: <span className="text-slate-900 font-bold">{activeReport.recordCount}</span></div>
                <div>Data Quality: <span className="text-emerald-700 font-semibold">{activeReport.dataQualityNotes}</span></div>
                <div>Status: <span className="text-blue-700 font-medium">Archived on Server</span></div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 font-mono text-xs">
              Select a report from the archive to view details.
            </div>
          )}
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Compile New Environmental Report
              </h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Report Title</label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Report Classification</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Daily Monitoring Report">Daily Monitoring Report</option>
                    <option value="Weekly Sensor Audit">Weekly Sensor Audit</option>
                    <option value="Flood Research Brief">Flood Research Brief</option>
                    <option value="Geotechnical Landslide Brief">Geotechnical Landslide Brief</option>
                    <option value="Solar Power Telemetry Report">Solar Power Telemetry Report</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Observation Period</label>
                  <input
                    type="text"
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Executive Findings Summary</label>
                <textarea
                  rows={3}
                  value={reportSummary}
                  onChange={(e) => setReportSummary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
