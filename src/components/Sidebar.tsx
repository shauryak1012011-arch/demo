import React from 'react';
import {
  LayoutDashboard,
  Radio,
  TowerControl,
  Cpu,
  Flame,
  MapPin,
  Bell,
  Database,
  Bot,
  FlaskConical,
  BarChart3,
  Share2,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  userRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  collapsed,
  onToggleCollapsed,
  userRole,
  onSwitchRole
}) => {
  const navItems = [
    { id: 'command-centre', label: 'Command Centre', icon: LayoutDashboard },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Radio },
    { id: 'monitoring-poles', label: 'Monitoring Poles', icon: TowerControl },
    { id: 'sensor-intelligence', label: 'Sensor Intelligence', icon: Cpu },
    { id: 'disaster-intelligence', label: 'Disaster Intelligence', icon: Flame },
    { id: 'gis-risk-map', label: 'GIS Risk Map', icon: MapPin },
    { id: 'alert-management', label: 'Alert Management', icon: Bell },
    { id: 'historical-database', label: 'Historical Database', icon: Database },
    { id: 'ai-research-assistant', label: 'AI Research Assistant', icon: Bot },
    { id: 'simulation-laboratory', label: 'Simulation Laboratory', icon: FlaskConical },
    { id: 'analytics-reports', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'data-sources', label: 'Data Sources', icon: Share2 },
    { id: 'system-health', label: 'System Health', icon: Activity },
    { id: 'settings-admin', label: 'Settings & Admin', icon: Settings }
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-200 z-30 shrink-0 shadow-sm ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              DG
            </div>
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-slate-900 truncate">DisasterGuard AI</span>
              <span className="text-[10px] text-blue-600 font-mono font-semibold tracking-wider truncate">MULTI-HAZARD NET</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm mx-auto">
            DG
          </div>
        )}
        <button
          onClick={onToggleCollapsed}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Role Switcher in Sidebar Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        {!collapsed ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center gap-1 font-mono font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                ACTIVE ROLE
              </span>
              <span className="text-blue-700 font-bold">{userRole}</span>
            </div>
            <select
              value={userRole}
              onChange={(e) => onSwitchRole(e.target.value as UserRole)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="OPERATOR">Operator</option>
              <option value="RESEARCHER">Researcher</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
        ) : (
          <button
            onClick={() => onToggleCollapsed()}
            className="w-full flex justify-center text-slate-500 hover:text-blue-600"
            title={`Role: ${userRole}`}
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
          </button>
        )}
      </div>
    </aside>
  );
};
