import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DemoBanner } from './components/DemoBanner';
import { GlobalEmergencyBanner } from './components/GlobalEmergencyBanner';

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
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

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

  // Global Hardware Siren Test State
  const [hardwareTest, setHardwareTest] = useState<{
    active: boolean;
    poleId: string;
    startedAt: string | null;
    durationSeconds: number;
    authorizedBy: string;
    countdownRemaining: number;
    beaconActive: boolean;
    buzzerActive: boolean;
  }>({
    active: false,
    poleId: 'DG-IND-DEMO',
    startedAt: null,
    durationSeconds: 15,
    authorizedBy: 'Exhibition Director',
    countdownRemaining: 0,
    beaconActive: false,
    buzzerActive: false
  });

  // Speech Announcement Synthesizer (Bilingual Web Speech API)
  const speakAnnouncement = useCallback((message: string, lang = language) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  // Emergency Stop Handler
  const handleEmergencyStop = async () => {
    try {
      const res = await fetch('/api/alerts/hardware-test/emergency-stop', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.hardwareTest) {
        setHardwareTest(data.hardwareTest);
      } else {
        setHardwareTest((prev) => ({ ...prev, active: false }));
      }
      speakAnnouncement(
        language === 'hi'
          ? 'आपातकालीन रोक सक्रिय की गई। हार्डवेयर सायरन बंद किया गया।'
          : 'Emergency stop activated. Hardware siren test terminated.'
      );
    } catch (err) {
      console.error('Failed to trigger emergency stop:', err);
      setHardwareTest((prev) => ({ ...prev, active: false }));
    }
  };

  // Fetch initial telemetry and database items
  const loadInitialData = async () => {
    try {
      const [pRes, sRes, aRes, hRes, uRes, tRes] = await Promise.all([
        fetch('/api/poles'),
        fetch('/api/sensors'),
        fetch('/api/alerts'),
        fetch('/api/historical-disasters'),
        fetch('/api/auth/me'),
        fetch('/api/alerts/hardware-test/status')
      ]);

      const [pData, sData, aData, hData, uData, tData] = await Promise.all([
        pRes.json(),
        sRes.json(),
        aRes.json(),
        hRes.json(),
        uRes.json(),
        tRes.json()
      ]);

      setPoles(pData.poles || []);
      setSensors(sData.sensors || []);
      setAlerts(aData.alerts || []);
      setHistoricalDisasters(hData.records || []);
      if (uData.user) setCurrentUser(uData.user);
      if (tData.testState) setHardwareTest(tData.testState);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Setup Server-Sent Events (SSE) live push stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events/stream');
      eventSource.addEventListener('hardware_test_started', (e: any) => {
        const testState = JSON.parse(e.data);
        setHardwareTest(testState);
        speakAnnouncement(
          language === 'hi'
            ? 'चेतावनी: प्रदर्शनी हार्डवेयर सायरन परीक्षण सक्रिय है।'
            : 'Warning: Controlled exhibition hardware siren demonstration test active.'
        );
      });
      eventSource.addEventListener('hardware_test_stopped', (e: any) => {
        const testState = JSON.parse(e.data);
        setHardwareTest(testState);
      });
      eventSource.addEventListener('alert_created', () => {
        fetch('/api/alerts').then((r) => r.json()).then((d) => setAlerts(d.alerts || []));
      });
    } catch (e) {
      console.warn('SSE not supported or connection error, using polling');
    }

    // Polling fallback every 5 seconds
    const interval = setInterval(async () => {
      try {
        const [pRes, sRes, aRes, tRes] = await Promise.all([
          fetch('/api/poles'),
          fetch('/api/sensors'),
          fetch('/api/alerts'),
          fetch('/api/alerts/hardware-test/status')
        ]);
        const [pData, sData, aData, tData] = await Promise.all([
          pRes.json(),
          sRes.json(),
          aRes.json(),
          tRes.json()
        ]);
        setPoles(pData.poles || []);
        setSensors(sData.sensors || []);
        setAlerts(aData.alerts || []);
        if (tData.testState) setHardwareTest(tData.testState);
      } catch {
        // quiet poll
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [language, speakAnnouncement]);

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
    if (language === 'hi') {
      switch (currentView) {
        case 'command-centre':
          return 'कमांड सेंटर डैशबोर्ड (Command Centre)';
        case 'live-monitoring':
          return 'लाइव स्टेशन टेलीमेट्री (Live Telemetry)';
        case 'monitoring-poles':
          return 'निगरानी पोल प्रबंधन (Monitoring Poles)';
        case 'sensor-intelligence':
          return 'सेंसर बुद्धिमत्ता एवं अंशांकन (Sensor Intelligence)';
        case 'disaster-intelligence':
          return 'बहु-आपदा विश्लेषिकी (Disaster Intelligence)';
        case 'gis-risk-map':
          return 'जीआईएस जोखिम मानचित्र (GIS Risk Map)';
        case 'alert-management':
          return 'चेतावनी प्रबंधन एवं सायरन (Alerts & Siren)';
        case 'historical-database':
          return '10-वर्षीय ऐतिहासिक आपदा अभिलेखागार (Historical Archive)';
        case 'ai-research-assistant':
          return 'एआई अनुसंधान सहायक (AI Research Assistant)';
        case 'simulation-laboratory':
          return 'विज्ञान प्रदर्शनी सिमुलेशन प्रयोगशाला (Simulation Lab)';
        case 'analytics-reports':
          return 'विश्लेषिकी एवं अनुसंधान रिपोर्ट (Analytics & Reports)';
        case 'data-sources':
          return 'बाहरी वैज्ञानिक डेटा स्रोत (Data Sources)';
        case 'system-health':
          return 'सिस्टम स्वास्थ्य एवं सुरक्षा ऑडिट (System Health)';
        case 'settings-admin':
          return 'प्रशासन एवं सेटिंग्स (Settings & Admin)';
        default:
          return 'कमांड सेंटर डैशबोर्ड';
      }
    }

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
      {/* Global Emergency Stop Banner for Active Siren Test */}
      <GlobalEmergencyBanner
        testState={hardwareTest}
        onEmergencyStop={handleEmergencyStop}
        language={language}
      />

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
          {/* Top Bar Header with Bilingual Toggle & Speech */}
          <Header
            currentViewTitle={getViewTitle()}
            currentUser={currentUser}
            alerts={alerts}
            onOpenAlerts={() => setCurrentView('alert-management')}
            onSearchClick={() => setCurrentView('historical-database')}
            language={language}
            onToggleLanguage={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            onPlayAnnouncement={(msg) => speakAnnouncement(msg)}
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
