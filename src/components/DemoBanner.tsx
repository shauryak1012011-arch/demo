import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-amber-950 gap-2">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 font-mono uppercase tracking-wider text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
          RESEARCH &amp; PROTOTYPE ENVIRONMENT
        </span>
        <span className="hidden sm:inline text-amber-800">
          Multi-hazard research network for science exhibition. Physical telemetry and simulated datasets are isolated.
        </span>
      </div>
      <div className="flex items-center gap-3 text-amber-800 font-mono text-[11px]">
        <span>Standard: NDMA / WMO Study Protocol</span>
        <span aria-hidden="true">·</span>
        <span className="text-amber-900 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          Educational Prototype
        </span>
      </div>
    </div>
  );
};
