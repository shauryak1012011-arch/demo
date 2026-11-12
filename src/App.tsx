import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DemoBanner } from './components/DemoBanner';

import { CommandCentreView } from './views/CommandCentreView';
import { LiveMonitoringView } from './views/LiveMonitoringView';
import { MonitoringPolesView } from './views/MonitoringPolesView';
import { SensorIntelligenceView } from './views/SensorIntelligenceView';
import { DisasterIntelligenceView } from './views/DisasterIntelligenceView';
import { GisRiskMapView } from './views/GisRiskMapView';
import { AlertManagementView } from './views/AlertManagementView';
import { HistoricalDatabaseView } from './views/HistoricalDatabaseView';
import { AiResearchAssistantView } from './views/AiResearchAssistantView';
import { SimulationLaboratoryView } from './views/SimulationLaboratoryView';
import { AnalyticsReportsView } from './views/AnalyticsReportsView';
import { DataSourcesView } from './views/DataSourcesView';
import { SystemHealthView } from './views/SystemHealthView';
import { SettingsAdminView } from './views/SettingsAdminView';

import { MonitoringPole, Sensor, Alert, HistoricalDisaster, User, UserRole } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<string>('command-centre');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [selectedPoleId, setSelectedPoleId] = useState<string | null>(null);

  // Core Data States
  const [poles, setPoles] = useState<MonitoringPole[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [historicalDisasters, setHistoricalDisasters] = useState<HistoricalDisaster[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'USR-001',
    name: 'Dr. Aarav Sharma',
    email: 'agroalert829@gmail.com',
    role: 'SUPER_ADMIN',
    agency: 'National Multi-Hazard Research Consortium'
  });

  // Fetch initial telemetry and database items
  const loadInitialData = async () => {
    try {
      const [pRes, sRes, aRes, hRes, uRes] = await Promise.all([
        fetch('/api/poles'),
        fetch('/api/sensors'),
        fetch('/api/alerts'),
        fetch('/api/historical-disasters'),
        fetch('/api/auth/me')
      ]);

      const [pData, sData, aData, hData, uData] = await Promise.all([
        pRes.json(),
        sRes.json(),
        aRes.json(),
        hRes.json(),
        uRes.json()
      ]);

      setPoles(pData.poles || []);
      setSensors(sData.sensors || []);
      setAlerts(aData.alerts || []);
      setHistoricalDisasters(hData.disasters || []);
      if (uData.user) setCurrentUser(uData.user);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
    // Poll telemetry & alerts every 6 seconds to capture live simulator events
    const interval = setInterval(async () => {
      try {
        const [pRes, sRes, aRes] = await Promise.all([
          fetch('/api/poles'),
          fetch('/api/sensors'),
          fetch('/api/alerts')
        ]);
        const [pData, sData, aData] = await Promise.all([pRes.json(), sRes.json(), aRes.json()]);
        setPoles(pData.poles || []);
        setSensors(sData.sensors || []);
        setAlerts(aData.alerts || []);
      } catch (e) {
        // quiet poll
      }
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSwitchRole = async (role: UserRole) => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPole = (poleId: string) => {
    setSelectedPoleId(poleId);
    setCurrentView('monitoring-poles');
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'command-centre':
        return 'Command Centre Dashboard';
      case 'live-monitoring':
        return 'Live Station Telemetry Stream';
      case 'monitoring-poles':
        return 'Monitoring Pole & Infrastructure Management';
      case 'sensor-intelligence':
        return 'Sensor Intelligence & Calibration Module';
      case 'disaster-intelligence':
        return 'Multi-Hazard Explainable Risk Analytics';
      case 'gis-risk-map':
        return 'Interactive GIS Multi-Hazard Risk Map';
      case 'alert-management':
        return 'Early-Warning Alerts & Controlled Beacon Testing';
      case 'historical-database':
        return '10-Year Historical Disaster Research Database';
      case 'ai-research-assistant':
        return 'DisasterGuard AI Research Assistant & Vision';
      case 'simulation-laboratory':
        return 'Science Exhibition Simulation Laboratory';
      case 'analytics-reports':
        return 'Formal Analytics & Multi-Hazard Research Reports';
      case 'data-sources':
        return 'External Scientific Data Sources & Connectors';
      case 'system-health':
        return 'Platform System Health & Security Audit Trail';
      case 'settings-admin':
        return 'Settings, Parameters & Role Access Control';
      default:
        return 'Command Centre Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Research & Prototype Disclaimer Banner */}
      <DemoBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentView={currentView}
          onSelectView={(v) => {
            setCurrentView(v);
            if (v !== 'monitoring-poles') setSelectedPoleId(null);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
          userRole={currentUser.role}
          onSwitchRole={handleSwitchRole}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar Header */}
          <Header
            currentViewTitle={getViewTitle()}
            currentUser={currentUser}
            alerts={alerts}
            onOpenAlerts={() => setCurrentView('alert-management')}
            onSearchClick={() => setCurrentView('historical-database')}
          />

          {/* View Container */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
            {currentView === 'command-centre' && (
              <CommandCentreView
                poles={poles}
                sensors={sensors}
                alerts={alerts}
                onNavigate={(v) => setCurrentView(v)}
                onOpenPole={handleOpenPole}
              />
            )}

            {currentView === 'live-monitoring' && (
              <LiveMonitoringView
                poles={poles}
                sensors={sensors}
                onRefreshTelemetry={loadInitialData}
              />
            )}

            {currentView === 'monitoring-poles' && (
              <MonitoringPolesView
                poles={poles}
                sensors={sensors}
                userRole={currentUser.role}
                onRefreshPoles={loadInitialData}
                selectedPoleId={selectedPoleId}
                onSelectPole={(id) => setSelectedPoleId(id)}
              />
            )}

            {currentView === 'sensor-intelligence' && (
              <SensorIntelligenceView
                sensors={sensors}
                poles={poles}
                userRole={currentUser.role}
                onRefreshSensors={loadInitialData}
              />
            )}

            {currentView === 'disaster-intelligence' && (
              <DisasterIntelligenceView
                poles={poles}
                sensors={sensors}
              />
            )}

            {currentView === 'gis-risk-map' && (
              <GisRiskMapView
                poles={poles}
                disasters={historicalDisasters}
                onOpenPole={handleOpenPole}
              />
            )}

            {currentView === 'alert-management' && (
              <AlertManagementView
                alerts={alerts}
                userRole={currentUser.role}
                onRefreshAlerts={loadInitialData}
              />
            )}

            {currentView === 'historical-database' && (
              <HistoricalDatabaseView
                disasters={historicalDisasters}
                userRole={currentUser.role}
                onRefreshDisasters={loadInitialData}
              />
            )}

            {currentView === 'ai-research-assistant' && (
              <AiResearchAssistantView />
            )}

            {currentView === 'simulation-laboratory' && (
              <SimulationLaboratoryView
                onRefreshTelemetry={loadInitialData}
              />
            )}

            {currentView === 'analytics-reports' && (
              <AnalyticsReportsView
                userRole={currentUser.role}
              />
            )}

            {currentView === 'data-sources' && (
              <DataSourcesView
                userRole={currentUser.role}
              />
            )}

            {currentView === 'system-health' && (
              <SystemHealthView />
            )}

            {currentView === 'settings-admin' && (
              <SettingsAdminView
                currentUser={currentUser}
                onSwitchRole={handleSwitchRole}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
