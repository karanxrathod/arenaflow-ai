import React, { useState, useEffect, useCallback } from 'react';
import { StadiumState, RiskAssessment, ChatMessage } from './types.js';
import Dashboard from './components/Dashboard.jsx';
import StadiumTwin from './components/StadiumTwin.jsx';
import RiskAnalysis from './components/RiskAnalysis.jsx';
import FanConcierge from './components/FanConcierge.jsx';
import VendorSync from './components/VendorSync.jsx';
import SafetyAgents from './components/SafetyAgents.jsx';
import Analytics from './components/Analytics.jsx';
import Settings from './components/Settings.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';
import { OnboardingTour } from './components/Onboarding/OnboardingTour.js';
import { NotificationCenter } from './components/Notifications/NotificationCenter.js';
import { Toast, ToastType } from './components/Common/Toast.js';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import { useTheme } from './context/ThemeContext.js';
import { useLanguage } from './context/LanguageContext.js';
import { useProfile } from './context/ProfileContext.js';

import { 
  ShieldCheck, 
  MapPin, 
  Activity, 
  Clock, 
  Globe, 
  Tv, 
  AlertTriangle, 
  Wifi, 
  Menu, 
  Search, 
  Bell, 
  User, 
  ChevronLeft, 
  LayoutDashboard, 
  Gauge, 
  MessageSquare, 
  Package, 
  Shield, 
  BarChart3, 
  Settings as SettingsIcon, 
  Check, 
  X,
  Play
} from 'lucide-react';

export default function App() {
  const { profile } = useProfile();
  const { language, setLanguage, t } = useLanguage();
  const { theme } = useTheme();

  // Toast notifications state
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ type, message });
  }, []);

  // Operational states
  const [state, setState] = useState<StadiumState | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>('zone-c');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'twin' | 'fan' | 'vendor' | 'safety' | 'analytics' | 'settings' | 'profile'>('dashboard');
  
  // Global search query
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // App layouts states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [loadingState, setLoadingState] = useState({
    stadium: true,
    risk: false,
    chat: false,
  });

  // Keyboard shortcuts registration
  useKeyboardShortcuts({
    setActiveTab,
    onCloseAllPanels: () => {
      setProfileDropdownOpen(false);
      setNotificationsOpen(false);
    }
  });

  // Fetch live stadium digital twin state
  const fetchStadiumState = useCallback(async (showLoader = false) => {
    if (showLoader) setLoadingState(prev => ({ ...prev, stadium: true }));
    try {
      const res = await fetch('/api/stadium-state');
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error('Failed to sync stadium state:', err);
    } finally {
      if (showLoader) setLoadingState(prev => ({ ...prev, stadium: false }));
    }
  }, []);

  // Recalculate AI Risk assessment using Gemini
  const handleRecalculateRisk = async () => {
    setLoadingState(prev => ({ ...prev, risk: true }));
    try {
      const res = await fetch('/api/risk-assessment', { method: 'POST' });
      if (res.ok) {
        const assessment = await res.json();
        setRiskAssessment(assessment);
      }
    } catch (err) {
      console.error('AI Risk calculation error:', err);
    } finally {
      setLoadingState(prev => ({ ...prev, risk: false }));
    }
  };

  // Adjust crowd density of a zone (simulate surge)
  const handleUpdateDensity = async (zoneId: string, density: number) => {
    try {
      const res = await fetch('/api/update-density', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoneId, density }),
      });
      if (res.ok) {
        const updatedState = await res.json();
        setState(updatedState);
        showToast('info', `Simulating density adjust: Sector ${zoneId.replace('zone-', '').toUpperCase()} set to ${density}%`);
      }
    } catch (err) {
      console.error('Failed to update density simulation:', err);
      showToast('error', 'Failed to adjust density simulation');
    }
  };

  // Dispatches a custom operational threat/incident
  const handleTriggerIncident = async (zoneId: string, severity: 'INFO' | 'WARNING' | 'CRITICAL', message: string) => {
    try {
      const res = await fetch('/api/trigger-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoneId, severity, message }),
      });
      if (res.ok) {
        const updatedState = await res.json();
        setState(updatedState);
        showToast('warning', `OPERATIONAL DIRECTIVE: Custom ${severity} alert dispatched to Sector ${zoneId.replace('zone-', '').toUpperCase()}`);
      }
    } catch (err) {
      console.error('Failed to trigger custom incident:', err);
      showToast('error', 'Failed to dispatch custom operational directive');
    }
  };

  // Send conversational fan navigation prompt to Gemini
  const handleSendFanMessage = async (text: string, language: string) => {
    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}-u`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory(prev => [...prev, userMsg]);
    setLoadingState(prev => ({ ...prev, chat: true }));

    try {
      const res = await fetch('/api/fan-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory.map(h => ({ role: h.role, text: h.text })),
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const modelMsg: ChatMessage = {
          id: `chat-${Date.now()}-m`,
          role: 'model',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language,
        };
        setChatHistory(prev => [...prev, modelMsg]);
        showToast('success', 'Fan assistant model generated real-time navigation reply');
      }
    } catch (err) {
      console.error('Error contacting Fan Agent:', err);
      showToast('error', 'Fan assistant translation/response failed');
    } finally {
      setLoadingState(prev => ({ ...prev, chat: false }));
    }
  };

  // Reset stadium state
  const handleResetState = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        const resetState = await res.json();
        setState(resetState);
        handleRecalculateRisk();
        showToast('success', 'Stadium digital twin successfully synchronized to operational baseline');
      }
    } catch (err) {
      console.error('Failed to reset state:', err);
      showToast('error', 'Failed to synchronize stadium digital twin');
    }
  };

  // Simulates a sudden multi-zone crowd bottleneck
  const handleSimulateCriticalSurge = async () => {
    if (!state) return;
    
    showToast('error', 'INJECTING CRITICAL STADIUM SURGE SIMULATION! Launching autonomous safety dispatches...');
    
    // Pick two critical entry zones and spike them
    await handleUpdateDensity('zone-c', 88); // Gate C Ingress bottleneck
    await handleUpdateDensity('zone-f', 79); // Gate F Ticket Scanner issue
    
    // Dispatch an operational threat
    await handleTriggerIncident(
      'zone-c', 
      'CRITICAL', 
      'Automated Telemetry alert: High-density bottleneck detected at Turnstile Line C. Dispatching safety signage.'
    );

    // Navigate to safety console so they can witness the multi-agent automation
    setActiveTab('safety');
  };

  // Initial loads and interval syncs
  useEffect(() => {
    fetchStadiumState(true);
    // Poll the backend periodically to get updates from autonomous agent processes
    const pollInterval = setInterval(() => {
      fetchStadiumState(false);
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [fetchStadiumState]);

  // Run initial risk assessment once stadium state is loaded
  useEffect(() => {
    if (state && !riskAssessment && !loadingState.risk) {
      handleRecalculateRisk();
    }
  }, [state, riskAssessment]);

  // Filter zones and concessions for global search
  const filteredZones = state 
    ? state.zones.filter(z => 
        z.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        z.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredConcessions = state
    ? state.vendorPreps.filter(v =>
        v.concessionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.zoneName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchResultClick = (type: 'zone' | 'concession', item: any) => {
    setSearchQuery('');
    setShowSearchResults(false);
    if (type === 'zone') {
      setSelectedZoneId(item.id);
      setActiveTab('twin');
    } else {
      setActiveTab('fan');
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text font-sans flex overflow-hidden selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200">
      
      {/* ================= SIDEBAR NAVIGATION ================= */}
      <aside 
        className={`bg-app-secondary border-r border-app-border h-screen flex flex-col justify-between transition-all duration-300 z-50 flex-shrink-0 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="p-4 border-b border-app-border flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 flex-shrink-0">
                <span className="text-sm">⚽</span>
              </div>
              {!sidebarCollapsed && (
                <div className="animate-fade-in">
                  <h1 className="font-display text-sm font-extrabold text-white dark:text-white light:text-slate-900 tracking-wide uppercase leading-none">
                    ArenaFlow <span className="text-amber-400">AI</span>
                  </h1>
                  <span className="text-[9px] text-slate-400 font-medium tracking-wide">Tournament Operations</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850 transition-all cursor-pointer"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Nav Items List */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{t('dashboard')}</span>}
            </button>

            <button
              id="tab-twin"
              onClick={() => setActiveTab('twin')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'twin'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <Gauge className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{t('stadiumTwin') || 'Stadium Twin'}</span>}
            </button>

            <button
              id="tab-fan"
              onClick={() => setActiveTab('fan')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'fan'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{t('fanAssistant') || 'Fan Assistant & Chat'}</span>}
            </button>

            <button
              onClick={() => setActiveTab('vendor')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'vendor'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <Package className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{t('vendorOperations') || 'Vendor Operations'}</span>}
            </button>

            <button
              id="tab-safety"
              onClick={() => setActiveTab('safety')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'safety'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{t('safetyAgent') || 'Safety Dispatch'}</span>}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{t('analytics') || 'Analytics & Reports'}</span>}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <SettingsIcon className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{t('settings') || 'Settings & Config'}</span>}
            </button>
          </nav>
        </div>

        {/* User profile card at the bottom - Now Clickable */}
        <div 
          onClick={() => setActiveTab('profile')}
          className={`p-4 border-t border-app-border cursor-pointer hover:bg-slate-850/50 transition-all ${
            activeTab === 'profile' ? 'bg-slate-850/70 border-r-2 border-r-amber-400 font-bold' : ''
          }`}
          title="Open Profile Settings"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-extrabold text-xs flex-shrink-0">
              {profile.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="animate-fade-in flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white dark:text-white light:text-slate-900 truncate">{profile.name}</p>
                <p className="text-[9px] text-slate-400 truncate">{profile.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* ================= GLOBAL TOP NAVIGATION ================= */}
        <header className="bg-slate-900 border-b border-slate-850 h-16 flex items-center justify-between px-6 z-40 flex-shrink-0">
          
          {/* Left: Global Search bar with smart suggestions */}
          <div className="relative w-80 max-w-md">
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 focus-within:ring-1 focus-within:ring-amber-500">
              <Search className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search zones, concessions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.trim() !== '');
                }}
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Float Search Dropdown */}
            {showSearchResults && (
              <div className="absolute top-11 left-0 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 p-2 max-h-60 overflow-y-auto">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block p-1 border-b border-slate-850">
                  Search Matches
                </span>
                
                {filteredZones.length === 0 && filteredConcessions.length === 0 && (
                  <p className="text-xs text-slate-500 p-2 text-center">No matches found.</p>
                )}

                {/* Zones Matches */}
                {filteredZones.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => handleSearchResultClick('zone', zone)}
                    className="w-full text-left p-2 hover:bg-slate-850 rounded-lg text-xs flex justify-between items-center transition-all cursor-pointer"
                  >
                    <span className="text-slate-200 font-medium">{zone.name}</span>
                    <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 px-1.5 rounded uppercase">Zone</span>
                  </button>
                ))}

                {/* Concession Matches */}
                {filteredConcessions.map(con => (
                  <button
                    key={con.zoneId}
                    onClick={() => handleSearchResultClick('concession', con)}
                    className="w-full text-left p-2 hover:bg-slate-850 rounded-lg text-xs flex justify-between items-center transition-all cursor-pointer"
                  >
                    <span className="text-slate-200 font-medium">{con.concessionName}</span>
                    <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 px-1.5 rounded uppercase">Vendor</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Telemetry Widget, language, notifications, avatar */}
          <div className="flex items-center gap-4">
            
            {/* Live Ticker Telemetry bar */}
            <div className="hidden xl:flex items-center gap-4 text-xs bg-slate-950/60 p-1.5 px-3 rounded-xl border border-slate-850">
              <div className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>MetLife Stadium, NYNJ</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400 border-l border-slate-850 pl-4">
                <Tv className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>USA vs Mexico <strong className="text-white">2 - 1</strong></span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 border-l border-slate-850 pl-4 font-mono font-bold">
                <Wifi className="w-3.5 h-3.5" />
                <span>SYNCED</span>
              </div>
            </div>

            {/* Language Selector Selector dropdown */}
            <LanguageSelector />

            {/* Light/Dark Theme Toggle */}
            <ThemeToggle />

            {/* Notification bell dropdown list */}
            <NotificationCenter 
              incidents={state ? state.incidents : []}
              onNavigateToSafety={() => {
                setActiveTab('safety');
                showToast('info', 'Viewing Active Operational Safety Alerts');
              }}
            />

            {/* User profile Menu dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-amber-400 font-bold hover:border-amber-500/40 cursor-pointer"
              >
                <div className="text-amber-400 text-xs font-extrabold font-display">
                  {profile.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-11 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 p-2 text-xs">
                  <div className="p-2 border-b border-slate-850">
                    <p className="font-bold text-white">{profile.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{profile.email}</p>
                  </div>

                  <div className="p-1 space-y-0.5 mt-1">
                    <button 
                      onClick={() => { setActiveTab('profile'); setProfileDropdownOpen(false); }}
                      className="w-full text-left p-2 hover:bg-slate-850 rounded-lg cursor-pointer text-slate-200"
                    >
                      {t('profile') || 'Profile Settings'}
                    </button>
                    <button 
                      onClick={() => { setActiveTab('settings'); setProfileDropdownOpen(false); }}
                      className="w-full text-left p-2 hover:bg-slate-850 rounded-lg cursor-pointer text-slate-200"
                    >
                      {t('settings') || 'System Config'}
                    </button>
                    <button 
                      onClick={() => { handleResetState(); setProfileDropdownOpen(false); }}
                      className="w-full text-left p-2 hover:bg-slate-850 text-amber-400 rounded-lg cursor-pointer"
                    >
                      {t('resetSimulation') || 'Reset App State'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ================= PRIMARY DISPLAY BODY ================= */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {loadingState.stadium && !state ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
              <p className="text-sm text-slate-400 font-mono">Synchronizing digital twin with stadium telemetry servers...</p>
            </div>
          ) : state ? (
            <div className="space-y-6">
              
              {/* PAGE MODULE 1: Operations Dashboard */}
              {activeTab === 'dashboard' && (
                <div className="animate-fade-in">
                  <Dashboard
                    state={state}
                    risk={riskAssessment}
                    onNavigate={(tab) => setActiveTab(tab)}
                    onSimulateCriticalSurge={handleSimulateCriticalSurge}
                  />
                </div>
              )}

              {/* PAGE MODULE 2: Command Twin */}
              {activeTab === 'twin' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Visual Stadium Twin Heatmap and Controller */}
                  <StadiumTwin
                    zones={state.zones}
                    selectedZoneId={selectedZoneId}
                    onSelectZone={setSelectedZoneId}
                    onUpdateDensity={handleUpdateDensity}
                  />

                  {/* Gemini AI Risk Analyzer */}
                  <RiskAnalysis
                    assessment={riskAssessment}
                    loading={loadingState.risk}
                    onRefresh={handleRecalculateRisk}
                  />
                </div>
              )}

              {/* PAGE MODULE 3: Fan Concierge Assistant */}
              {activeTab === 'fan' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                  {/* Multilingual AI Wayfinder */}
                  <FanConcierge
                    chatHistory={chatHistory}
                    onSendMessage={handleSendFanMessage}
                    loading={loadingState.chat}
                    onClearHistory={() => setChatHistory([])}
                  />

                  {/* Vendor Operations supply tracker */}
                  <VendorSync preps={state.vendorPreps} />
                </div>
              )}

              {/* PAGE MODULE 4: Concessions operations */}
              {activeTab === 'vendor' && (
                <div className="animate-fade-in">
                  <VendorSync preps={state.vendorPreps} />
                </div>
              )}

              {/* PAGE MODULE 5: Safety agents dispatcher */}
              {activeTab === 'safety' && (
                <div className="animate-fade-in">
                  <SafetyAgents
                    logs={state.agentLogs}
                    incidents={state.incidents}
                    zones={state.zones}
                    onTriggerIncident={handleTriggerIncident}
                    onReset={handleResetState}
                  />
                </div>
              )}

              {/* PAGE MODULE 6: Analytics Comparisons */}
              {activeTab === 'analytics' && (
                <div className="animate-fade-in">
                  <Analytics state={state} />
                </div>
              )}

              {/* PAGE MODULE 7: System Settings & Profile */}
              {activeTab === 'settings' && (
                <div className="animate-fade-in">
                  <Settings onReset={handleResetState} />
                </div>
              )}

              {/* PAGE MODULE 8: Profile Management Settings */}
              {activeTab === 'profile' && (
                <div className="animate-fade-in">
                  <ProfilePage />
                </div>
              )}

            </div>
          ) : null}

        </main>

        {/* ================= GLOBAL COMPACT FOOTER ================= */}
        <footer className="bg-slate-900 border-t border-slate-850 px-6 py-3 text-xs text-slate-500 font-mono flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>ArenaFlow AI Core Operations • FIFA World Cup 2026</span>
          <span className="flex items-center gap-1.5 text-[10px]">
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            Designed for World Cup Venue Operations
          </span>
        </footer>

        {/* ================= ONBOARDING TOUR ================= */}
        <OnboardingTour activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* ================= TOAST NOTIFICATIONS ================= */}
        {toast && (
          <div className="fixed bottom-6 left-6 z-[9999] pointer-events-none">
            <Toast 
              type={toast.type} 
              message={toast.message} 
              onClose={() => setToast(null)} 
            />
          </div>
        )}

      </div>

    </div>
  );
}
