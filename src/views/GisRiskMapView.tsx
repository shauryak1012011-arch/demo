import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  Filter,
  X,
  ExternalLink,
  TowerControl,
  Flame,
  Droplets,
  Activity,
  Mountain,
  CloudLightning,
  ShieldAlert
} from 'lucide-react';
import { MonitoringPole, HistoricalDisaster } from '../types';
import { formatDate } from '../utils/formatters';

interface GisRiskMapViewProps {
  poles: MonitoringPole[];
  disasters: HistoricalDisaster[];
  onOpenPole: (poleId: string) => void;
}

export const GisRiskMapView: React.FC<GisRiskMapViewProps> = ({
  poles,
  disasters,
  onOpenPole
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedItem, setSelectedItem] = useState<{ type: 'pole' | 'disaster'; data: any } | null>(null);
  const [showPoles, setShowPoles] = useState(true);
  const [showDisasters, setShowDisasters] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.5, 82.5],
        zoom: 5,
        zoomControl: true,
        attributionControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors | DisasterGuard AI'
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!markersLayer || !map) return;

    markersLayer.clearLayers();

    // Add Poles
    if (showPoles) {
      poles.forEach((pole) => {
        const isDemo = pole.isDemo;
        const color = isDemo ? '#2563EB' : pole.status === 'warning' ? '#D97706' : '#059669';

        const customIcon = L.divIcon({
          className: 'custom-pole-marker',
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.35);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([pole.latitude, pole.longitude], { icon: customIcon });
        marker.on('click', () => {
          setSelectedItem({ type: 'pole', data: pole });
        });
        marker.addTo(markersLayer);
      });
    }

    // Add Historical Disasters
    if (showDisasters) {
      disasters.forEach((d) => {
        if (categoryFilter !== 'all' && d.category !== categoryFilter) return;

        let col = '#DC2626'; // red
        if (d.category === 'flood') col = '#0284C7'; // sky blue
        else if (d.category === 'cyclone') col = '#EA580C'; // orange
        else if (d.category === 'landslide') col = '#CA8A04'; // gold/amber
        else if (d.category === 'earthquake') col = '#9333EA'; // purple

        const disasterIcon = L.divIcon({
          className: 'custom-disaster-marker',
          html: `<div style="background-color: ${col}; width: 11px; height: 11px; border-radius: 2px; border: 1.5px solid #ffffff; transform: rotate(45deg); box-shadow: 0 1px 5px rgba(0,0,0,0.3);"></div>`,
          iconSize: [11, 11],
          iconAnchor: [5, 5]
        });

        const marker = L.marker([d.latitude, d.longitude], { icon: disasterIcon });
        marker.on('click', () => {
          setSelectedItem({ type: 'disaster', data: d });
        });
        marker.addTo(markersLayer);
      });
    }
  }, [poles, disasters, showPoles, showDisasters, categoryFilter]);

  return (
    <div className="space-y-4">
      {/* Top Map Control Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="font-bold text-slate-900 flex items-center gap-1.5 font-mono">
            <Layers className="w-4 h-4 text-blue-600" />
            GIS MAP LAYERS:
          </span>

          <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={showPoles}
              onChange={(e) => setShowPoles(e.target.checked)}
              className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Monitoring Poles ({poles.length})
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={showDisasters}
              onChange={(e) => setShowDisasters(e.target.checked)}
              className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-red-600 rotate-45" />
              10-Yr Historical Disasters
            </span>
          </label>
        </div>

        {/* Hazard Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 shadow-2xs"
          >
            <option value="all">All Disaster Categories</option>
            <option value="flood">Floods &amp; Inundations</option>
            <option value="cyclone">Cyclones &amp; Tropical Storms</option>
            <option value="landslide">Landslides &amp; Debris Flows</option>
            <option value="earthquake">Earthquakes &amp; Seismic Events</option>
          </select>
        </div>
      </div>

      {/* Map Canvas and Side Inspection Panel */}
      <div className="relative h-[650px] w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Selected Item Drawer */}
        {selectedItem && (
          <div className="absolute top-4 right-4 z-20 w-80 max-w-[90vw] bg-white/95 backdrop-blur border border-slate-300 rounded-xl p-4 shadow-xl text-xs space-y-3">
            <div className="flex items-start justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="font-mono text-[10px] text-blue-700 font-bold uppercase tracking-wider block">
                  {selectedItem.type === 'pole' ? 'MONITORING STATION' : 'HISTORICAL DISASTER RECORD'}
                </span>
                <h4 className="font-bold text-slate-900 text-sm">
                  {selectedItem.type === 'pole' ? selectedItem.data.name : selectedItem.data.eventName}
                </h4>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedItem.type === 'pole' ? (
              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">POLE ID:</span>
                  <span className="text-blue-700 font-bold">{selectedItem.data.id}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">COORDINATES:</span>
                  <span className="text-slate-900">
                    {selectedItem.data.latitude.toFixed(4)}°N, {selectedItem.data.longitude.toFixed(4)}°E
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TOPOGRAPHY:</span>
                  <span className="capitalize text-slate-900 font-medium">{selectedItem.data.poleType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SENSORS:</span>
                  <span className="font-mono text-emerald-700 font-bold">{selectedItem.data.assignedSensorIds.length} Nodes</span>
                </div>
                <button
                  onClick={() => onOpenPole(selectedItem.data.id)}
                  className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  Inspect Station Telemetry
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">CATEGORY:</span>
                  <span className="text-orange-700 uppercase font-bold">{selectedItem.data.category}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">DATE:</span>
                  <span className="text-slate-900">{formatDate(selectedItem.data.dateTime).slice(0, 12)}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">INTENSITY:</span>
                  <span className="text-red-600 font-bold">{selectedItem.data.intensityMagnitude}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">REGION:</span>
                  <span className="text-slate-900 font-medium">{selectedItem.data.stateOrRegion}, {selectedItem.data.country}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                  {selectedItem.data.description}
                </div>
                <div className="flex justify-between items-center pt-1 text-[10px] text-blue-700 font-mono">
                  <span>Source: {selectedItem.data.sourceName}</span>
                  <a
                    href={selectedItem.data.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline flex items-center gap-1 font-semibold"
                  >
                    Catalog Link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legend Overlay in Bottom Left */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur border border-slate-200 rounded-lg p-3 text-[11px] font-mono text-slate-700 space-y-1.5 shadow-md">
          <div className="font-bold text-slate-900 text-[10px] uppercase border-b border-slate-200 pb-1">Map Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Online Station Pole</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Exhibition Demo Pole</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-600 rotate-45" />
            <span>Historical Flood</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-purple-600 rotate-45" />
            <span>Historical Earthquake</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-orange-600 rotate-45" />
            <span>Historical Cyclone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-600 rotate-45" />
            <span>Historical Landslide</span>
          </div>
        </div>
      </div>
    </div>
  );
};
