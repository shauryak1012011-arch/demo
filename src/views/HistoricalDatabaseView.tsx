import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Download,
  Plus,
  ExternalLink,
  Calendar,
  MapPin,
  CheckCircle2,
  FileText,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { HistoricalDisaster, UserRole } from '../types';
import { formatDate } from '../utils/formatters';

interface HistoricalDatabaseViewProps {
  disasters: HistoricalDisaster[];
  userRole: UserRole;
  onRefreshDisasters: () => void;
}

export const HistoricalDatabaseView: React.FC<HistoricalDatabaseViewProps> = ({
  disasters,
  userRole,
  onRefreshDisasters
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startYear, setStartYear] = useState('2016');
  const [endYear, setEndYear] = useState('2026');
  const [showImportModal, setShowImportModal] = useState(false);

  const [newRecord, setNewRecord] = useState({
    eventName: '',
    category: 'flood' as any,
    dateTime: '2023-07-13T12:00:00Z',
    latitude: 28.6139,
    longitude: 77.209,
    country: 'India',
    stateOrRegion: 'Delhi',
    intensityMagnitude: 'Record River Stage 208.66m',
    description: 'Upper catchment cloudburst led to barrage discharge flood wave.',
    sourceName: 'Central Water Commission (CWC)',
    sourceUrl: 'https://cwc.gov.in'
  });

  const canEdit = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'RESEARCHER';

  const filtered = disasters.filter((d) => {
    const matchesSearch =
      d.eventName.toLowerCase().includes(search.toLowerCase()) ||
      d.stateOrRegion.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter;
    const year = new Date(d.dateTime).getFullYear();
    const matchesYears = year >= Number(startYear) && year <= Number(endYear);

    return matchesSearch && matchesCategory && matchesYears;
  });

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/historical-disasters/import-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });
      if (res.ok) {
        setShowImportModal(false);
        onRefreshDisasters();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Event Name', 'Category', 'Date', 'Latitude', 'Longitude', 'State/Region', 'Country', 'Intensity', 'Source', 'Source URL'];
    const rows = filtered.map((d) => [
      `"${d.id}"`,
      `"${d.eventName.replace(/"/g, '""')}"`,
      `"${d.category}"`,
      `"${d.dateTime}"`,
      d.latitude,
      d.longitude,
      `"${d.stateOrRegion}"`,
      `"${d.country}"`,
      `"${d.intensityMagnitude}"`,
      `"${d.sourceName}"`,
      `"${d.sourceUrl}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DisasterGuard_Historical_Disasters_${startYear}_${endYear}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
            DECADE ARCHIVE: 12 NOV 2016 — 12 NOV 2026
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1.5">
            Historical Natural Disaster &amp; Hazard Database
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl mt-1 leading-relaxed">
            Standardized catalog documenting significant meteorological, hydrological, seismic, and geomorphic events across India and global comparator zones with preserved source IDs and origin URLs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV ({filtered.length})
          </button>
          {canEdit && (
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Import Disaster Record
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event name, location, or source..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-64 shadow-2xs"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 shadow-2xs"
          >
            <option value="all">All Hazard Categories</option>
            <option value="cyclone">Tropical Cyclones</option>
            <option value="flood">Floods &amp; GLOFs</option>
            <option value="landslide">Landslides &amp; Rockslides</option>
            <option value="earthquake">Earthquakes (Mw 6.0+)</option>
            <option value="wildfire">Wildfires</option>
            <option value="heatwave">Heatwaves</option>
          </select>

          <div className="flex items-center gap-1.5 text-slate-600 font-mono">
            <span>Range:</span>
            <input
              type="number"
              min="2016"
              max="2026"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className="w-16 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 text-center font-bold"
            />
            <span>to</span>
            <input
              type="number"
              min="2016"
              max="2026"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              className="w-16 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 text-center font-bold"
            />
          </div>
        </div>

        <span className="text-slate-500 font-mono text-xs">
          Showing <span className="text-blue-700 font-bold">{filtered.length}</span> curated records
        </span>
      </div>

      {/* Disasters Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-mono font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Event Name &amp; ID</th>
                <th className="py-3 px-4">Hazard Category</th>
                <th className="py-3 px-4">Event Date</th>
                <th className="py-3 px-4">Location &amp; Coordinates</th>
                <th className="py-3 px-4">Measured Intensity</th>
                <th className="py-3 px-4">Catalog Source</th>
                <th className="py-3 px-4">Completeness</th>
                <th className="py-3 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{d.eventName}</div>
                    <div className="text-[10px] text-blue-700 font-mono font-semibold">{d.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        d.category === 'cyclone'
                          ? 'bg-orange-100 text-orange-800 border border-orange-300'
                          : d.category === 'flood'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : d.category === 'landslide'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-purple-100 text-purple-800 border border-purple-300'
                      }`}
                    >
                      {d.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-800">
                    {formatDate(d.dateTime).slice(0, 11)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-900 font-medium">{d.stateOrRegion}, {d.country}</div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {d.latitude.toFixed(2)}°N, {d.longitude.toFixed(2)}°E
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-red-600">
                    {d.intensityMagnitude}
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={d.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 hover:underline flex items-center gap-1 font-mono text-[11px] font-semibold"
                    >
                      {d.sourceName} <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-700 font-bold">
                    {d.dataCompleteness}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Import Historical Disaster Record
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Event Name</label>
                  <input
                    type="text"
                    required
                    value={newRecord.eventName}
                    onChange={(e) => setNewRecord({ ...newRecord, eventName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Hazard Category</label>
                  <select
                    value={newRecord.category}
                    onChange={(e) => setNewRecord({ ...newRecord, category: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
                  >
                    <option value="cyclone">Cyclone</option>
                    <option value="flood">Flood</option>
                    <option value="landslide">Landslide</option>
                    <option value="earthquake">Earthquake</option>
                    <option value="wildfire">Wildfire</option>
                    <option value="drought">Drought</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Date &amp; Time (ISO)</label>
                  <input
                    type="text"
                    value={newRecord.dateTime}
                    onChange={(e) => setNewRecord({ ...newRecord, dateTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Intensity / Magnitude</label>
                  <input
                    type="text"
                    value={newRecord.intensityMagnitude}
                    onChange={(e) => setNewRecord({ ...newRecord, intensityMagnitude: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newRecord.latitude}
                    onChange={(e) => setNewRecord({ ...newRecord, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newRecord.longitude}
                    onChange={(e) => setNewRecord({ ...newRecord, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">State / Region</label>
                  <input
                    type="text"
                    value={newRecord.stateOrRegion}
                    onChange={(e) => setNewRecord({ ...newRecord, stateOrRegion: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Source Name</label>
                  <input
                    type="text"
                    value={newRecord.sourceName}
                    onChange={(e) => setNewRecord({ ...newRecord, sourceName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-medium">Description &amp; Impact</label>
                <textarea
                  rows={2}
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded cursor-pointer shadow-xs"
                >
                  Save to 10-Yr Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
