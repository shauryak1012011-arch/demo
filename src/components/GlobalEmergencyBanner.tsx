import React from 'react';
import { AlertOctagon, Power, Volume2, ShieldAlert } from 'lucide-react';

interface GlobalEmergencyBannerProps {
  testState: {
    active: boolean;
    poleId: string;
    startedAt: string | null;
    durationSeconds: number;
    authorizedBy: string;
    countdownRemaining: number;
    beaconActive: boolean;
    buzzerActive: boolean;
  };
  onEmergencyStop: () => void;
  language?: 'en' | 'hi';
}

export const GlobalEmergencyBanner: React.FC<GlobalEmergencyBannerProps> = ({
  testState,
  onEmergencyStop,
  language = 'en'
}) => {
  if (!testState.active) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-2.5 shadow-lg border-b-2 border-red-800 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-white text-red-600 rounded-full font-bold">
          <ShieldAlert className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <span>
              {language === 'hi'
                ? 'नियंत्रित हार्डवेयर सायरन परीक्षण सक्रिय है'
                : 'CONTROLLED HARDWARE SIREN & BEACON TEST ACTIVE'}
            </span>
            <span className="bg-red-900/60 px-1.5 py-0.5 rounded text-[10px] font-mono border border-red-300/40">
              {testState.poleId}
            </span>
          </div>
          <div className="text-[11px] text-red-100 mt-0.5">
            {language === 'hi'
              ? `अधिकृत संचालक: ${testState.authorizedBy} · केवल विज्ञान प्रदर्शनी हेतु · स्वतः समाप्ति: ${testState.countdownRemaining || testState.durationSeconds}s`
              : `Authorized by: ${testState.authorizedBy} · Strictly Supervised Demonstration · Auto-Cutoff: ${testState.countdownRemaining || testState.durationSeconds}s`}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-red-950/70 text-red-200 px-3 py-1 rounded text-xs font-mono font-bold">
          <Volume2 className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>SIREN & BEACON LIVE</span>
        </div>

        <button
          onClick={onEmergencyStop}
          className="px-4 py-1.5 bg-white hover:bg-red-100 text-red-700 font-extrabold text-xs rounded-lg shadow-md transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider border border-white"
        >
          <Power className="w-4 h-4 text-red-700" />
          {language === 'hi' ? 'आपातकालीन रोक (ABORT)' : 'EMERGENCY STOP (ABORT)'}
        </button>
      </div>
    </div>
  );
};
