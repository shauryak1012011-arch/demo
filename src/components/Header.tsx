import React, { useState, useEffect } from 'react';
import { Bell, Wifi, Globe, Volume2 } from 'lucide-react';
import { User as UserType, Alert } from '../types';

interface HeaderProps {
  currentViewTitle: string;
  currentUser: UserType;
  alerts: Alert[];
  onOpenAlerts: () => void;
  onSearchClick: () => void;
  language?: 'en' | 'hi';
  onToggleLanguage?: () => void;
  onPlayAnnouncement?: (msg: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentViewTitle,
  currentUser,
  alerts,
  onOpenAlerts,
  language = 'en',
  onToggleLanguage,
  onPlayAnnouncement
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [utcStr, setUtcStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' IST'
      );
      setUtcStr(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  const handleTestAudio = () => {
    if (onPlayAnnouncement) {
      if (language === 'hi') {
        onPlayAnnouncement('चेतावनी: आपदा प्रबंधन प्रारंभिक चेतावनी अनुसंधान प्रणाली सामान्य रूप से कार्यरत है।');
      } else {
        onPlayAnnouncement('Warning: DisasterGuard AI multi-hazard monitoring network operational.');
      }
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4 z-20 shadow-xs">
      {/* View Title & Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-medium text-slate-500 hidden sm:inline">DisasterGuard AI</span>
        <span className="text-xs text-slate-300 hidden sm:inline" aria-hidden="true">/</span>
        <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight truncate">
          {currentViewTitle}
        </h1>
      </div>

      {/* Center Clocks & Live Connection */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-700">
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200 font-medium">
          <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === 'hi' ? 'लाइव स्ट्रीम सक्रिय' : 'IoT Stream Live'}</span>
        </div>
        <div className="text-slate-500 text-right">
          <div className="text-slate-900 font-semibold tabular-nums">{timeStr}</div>
          <div className="text-[10px] text-slate-500 tabular-nums">{utcStr}</div>
        </div>
      </div>

      {/* Actions: Bilingual Toggle, Notifications & User profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Bilingual English / Hindi Toggle Button */}
        {onToggleLanguage && (
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Toggle Language / भाषा बदलें"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-mono">{language === 'en' ? 'EN | हिंदी' : 'हिंदी | EN'}</span>
          </button>
        )}

        {/* Audio Announcement Quick Test Button */}
        {onPlayAnnouncement && (
          <button
            onClick={handleTestAudio}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer hidden sm:flex"
            title={language === 'hi' ? 'ऑडियो उद्घोषणा परीक्षण' : 'Test Speech Announcement'}
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
          </button>
        )}

        {/* Notifications Button */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          title="Active Monitoring Alerts"
        >
          <Bell className="w-4 h-4" />
          {unacknowledgedAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold font-mono shadow-xs">
              {unacknowledgedAlerts.length}
            </span>
          )}
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shadow-2xs">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[140px]">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-blue-600 font-mono font-medium leading-tight">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
