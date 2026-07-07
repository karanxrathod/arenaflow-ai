import { useState, useEffect, useCallback } from 'react';
import { StadiumState, RiskAssessment, ChatMessage } from './types.js';
import { getFallbackStadiumState, generateVendorPrepsForZones, getStatusFromDensity } from './utils/fallbackData.js';
import { OperationalDomain, DOMAIN_LABELS, adaptStadiumState, adaptRiskAssessment } from './utils/domainAdapter.js';
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
import { useLanguage } from './context/LanguageContext.js';
import { useProfile } from './context/ProfileContext.js';

import { 
  MapPin, 
  Globe, 
  Tv, 
  Wifi, 
  Search, 
  User, 
  ChevronLeft, 
  LayoutDashboard, 
  Gauge, 
  MessageSquare, 
  Package, 
  Shield, 
  BarChart3, 
  Settings as SettingsIcon, 
  X
} from 'lucide-react';

export default function App() {
  const { profile } = useProfile();
  const { t } = useLanguage();

  // Toast notifications state
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ type, message });
  }, []);

  // Operational states
  const [domain, setDomain] = useState<OperationalDomain>(() => {
    const saved = localStorage.getItem('arenaflow_domain');
    return (saved as OperationalDomain) || 'stadium';
  });

  useEffect(() => {
    localStorage.setItem('arenaflow_domain', domain);
  }, [domain]);

  const [useLocalFallback, setUseLocalFallback] = useState(false);
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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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
    }
  });

  // Log environment variables on mount to assist Vercel debugging
  useEffect(() => {
    console.log('--- Vercel Environment Variables Audit ---');
    console.log((import.meta as any).env);
    console.log('-----------------------------------------');
  }, []);

  // Fetch live stadium digital twin state
  const fetchStadiumState = useCallback(async (showLoader = false) => {
    if (showLoader) setLoadingState(prev => ({ ...prev, stadium: true }));
    try {
      const res = await fetch('/api/stadium-state');
      if (res.ok) {
        const data = await res.json();
        setState(data);
        setUseLocalFallback(false);
      } else {
        throw new Error('API server returned error status');
      }
    } catch (err) {
      console.warn('API sync failed, entering robust offline/Vercel fallback mode:', err);
      setUseLocalFallback(true);
      setState(prev => {
        if (!prev) {
          return getFallbackStadiumState();
        }
        return prev;
      });
    } finally {
      if (showLoader) setLoadingState(prev => ({ ...prev, stadium: false }));
    }
  }, []);

  // Recalculate AI Risk assessment using Gemini
  const handleRecalculateRisk = async () => {
    setLoadingState(prev => ({ ...prev, risk: true }));
    if (useLocalFallback) {
      setTimeout(() => {
        const avgDensity = state ? Math.round(state.zones.reduce((acc, curr) => acc + curr.density, 0) / state.zones.length) : 45;
        const highestDensity = state ? Math.max(...state.zones.map(z => z.density)) : 76;
        let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        if (highestDensity >= 75) level = 'CRITICAL';
        else if (highestDensity >= 55) level = 'HIGH';
        else if (highestDensity >= 35) level = 'MEDIUM';

        setRiskAssessment({
          score: Math.round(avgDensity * 1.2),
          level,
          summary: `Local Sandboxed Intelligence assessed stadium telemetry. Gate configurations show stable crowds with minor bottlenecks in selected high-volume ticket scanners.`,
          weatherImpact: `Temperature of ${state?.weather.temp || '27°C'} with Partly Cloudy comfort conditions. Comfort risk index: Minimal.`,
          transitImpact: `Transit Hubs reporting active passenger flow. ${state?.transit.shuttleStatus || 'Shuttles operating normally'}.`,
          recommendations: [
            `Keep auxiliary Gates open to bypass congestion in localized sectors.`,
            `Direct fan guides to divert fans from Gate G to adjacent Gates F or H.`,
            `Prepare concession preps dynamically based on incoming crowd counts.`
          ]
        });
        setLoadingState(prev => ({ ...prev, risk: false }));
      }, 500);
      return;
    }

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
    if (useLocalFallback) {
      setState(prev => {
        if (!prev) return prev;
        const newZones = prev.zones.map(z => {
          if (z.id === zoneId) {
            const targetDensity = Math.max(0, Math.min(100, density));
            const status = getStatusFromDensity(targetDensity);
            const currentCount = Math.round(z.capacity * (targetDensity / 100));
            const queueTimeMin = Math.round(targetDensity * 0.4);

            return {
              ...z,
              density: targetDensity,
              status,
              currentCount,
              queueTimeMin
            };
          }
          return z;
        });

        const updatedPreps = generateVendorPrepsForZones(newZones);
        
        // Multi-Agent simulation check
        const targetZone = prev.zones.find(z => z.id === zoneId);
        const oldDensity = targetZone ? targetZone.density : 0;
        let logs = [...prev.agentLogs];
        let incidents = [...prev.incidents];

        if (density >= 55 && oldDensity < 55) {
          const timestamp = new Date().toLocaleTimeString();
          const targetZoneObj = newZones.find(z => z.id === zoneId) || targetZone;
          const zoneName = targetZoneObj ? targetZoneObj.name : 'Sector';
          
          logs.unshift({
            id: `agent-log-${Date.now()}-1`,
            timestamp,
            agentName: 'Supervisor Agent',
            message: `🚨 ALERT: Density in ${zoneName} surged to ${density}%. Delegating flow analysis immediately.`,
            status: 'PROCESSING'
          });

          logs.unshift({
            id: `agent-log-${Date.now()}-2`,
            timestamp,
            agentName: 'Analysis Agent',
            message: `🔍 ANALYSIS: Turnstile flow rate at ${zoneName} is heavy. Nearby alternative gates are verified below 45% capacity.`,
            status: 'PROCESSING'
          });

          logs.unshift({
            id: `agent-log-${Date.now()}-3`,
            timestamp,
            agentName: 'Mitigation Agent',
            message: `⚙️ MITIGATION: Broadcaster triggered! Digital twin signage at ${zoneName} updated to: "USE ALTERNATIVE CORRIDORS".`,
            status: 'ALERT'
          });

          incidents.unshift({
            id: `inc-${Date.now()}`,
            timestamp,
            zoneId,
            zoneName: zoneName || 'Sector',
            severity: density >= 75 ? 'CRITICAL' : 'WARNING',
            message: `Autonomous agents mitigated high crowd load (${density}%) at ${zoneName}. Dynamic signage routed flow to alternate entries.`,
            status: 'RESOLVED',
            agentOwner: 'Mitigation Agent',
            mitigationPlan: 'Banners updated to disperse crowds to low density corridors.'
          });
        }

        return {
          ...prev,
          zones: newZones,
          vendorPreps: updatedPreps,
          agentLogs: logs,
          incidents
        };
      });
      showToast('info', `Simulating density adjust: Sector ${zoneId.replace('zone-', '').toUpperCase()} set to ${density}%`);
      return;
    }

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
    if (useLocalFallback) {
      setState(prev => {
        if (!prev) return prev;
        const targetZone = prev.zones.find(z => z.id === zoneId);
        const name = targetZone ? targetZone.name : 'Unknown Sector';
        const newIncident = {
          id: `inc-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          zoneId,
          zoneName: name,
          severity,
          message,
          status: 'OPEN' as const,
          agentOwner: 'Supervisor Agent',
          mitigationPlan: severity === 'CRITICAL' ? 'Diverting stadium spectators to alternative auxiliary entries.' : undefined
        };
        const newLog = {
          id: `agent-log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agentName: 'Supervisor Agent' as const,
          message: `⚠️ OPERATOR DIRECTIVE: ${severity} alert dispatched in ${name}: "${message}"`,
          status: 'ALERT' as const
        };
        return {
          ...prev,
          incidents: [newIncident, ...prev.incidents],
          agentLogs: [newLog, ...prev.agentLogs]
        };
      });
      showToast('warning', `OPERATIONAL DIRECTIVE: Custom ${severity} alert dispatched to Sector ${zoneId.replace('zone-', '').toUpperCase()}`);
      return;
    }

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

    if (useLocalFallback) {
      setTimeout(() => {
        const query = text.toLowerCase();
        let reply = '';

        if (language === 'Spanish') {
          if (query.includes('baño') || query.includes('toilet') || query.includes('restroom') || query.includes('wc')) {
            reply = 'Sugerencia de navegación: El baño más cercano con menor tiempo de espera es NE Restroom 105 en el sector Gate B (menos de 2 minutos de espera). Evite el sector Gate G.';
          } else if (query.includes('comida') || query.includes('taco') || query.includes('cerveza') || query.includes('hambre') || query.includes('comer')) {
            reply = 'Sugerencia de comida: World Cup Grill en Gate B tiene un tiempo de espera de 5 minutos. Samba Street Tacos en Gate C tiene alta demanda (22 minutos de espera).';
          } else if (query.includes('puerta') || query.includes('gate') || query.includes('salida') || query.includes('entrada') || query.includes('gente')) {
            reply = 'Monitoreo de puertas: Gate B y Gate F reportan descongestión (espera menor de 5 minutos). Gate G está al límite crítico, le recomendamos usar la entrada alternativa Gate H.';
          } else {
            reply = '¡Hola! Bienvenido al asistente de ArenaFlow AI. Las rutas de transporte y puertas están sincronizadas. ¿En qué sector se encuentra para guiarle?';
          }
        } else if (language === 'French') {
          if (query.includes('toilet') || query.includes('wc') || query.includes('restroom') || query.includes('toilette')) {
            reply = 'Conseil de navigation: Les toilettes les plus proches et libres se trouvent au Gate B (NE Restroom 105, moins de 2 minutes d\'attente). Évitez le secteur Gate G.';
          } else if (query.includes('manger') || query.includes('faim') || query.includes('taco') || query.includes('biere') || query.includes('nourriture')) {
            reply = 'Recommandation repas: World Cup Grill au Gate B (5 min d\'attente) ou Maple Waffles au Gate F (4 min). Évitez le secteur Gate C pour l\'instant.';
          } else if (query.includes('porte') || query.includes('gate') || query.includes('entree') || query.includes('foule')) {
            reply = 'Statut des portes: Les portes B et F sont fluides (moins de 5 min). Gate G est saturé, veuillez utiliser Gate H pour un accès rapide.';
          } else {
            reply = 'Bonjour! Bienvenue dans l\'assistant virtuel ArenaFlow AI. Comment puis-je vous guider vers votre secteur aujourd\'hui?';
          }
        } else if (language === 'Hindi') {
          if (query.includes('toilet') || query.includes('restroom') || query.includes('शौचालय') || query.includes('वॉशरुम')) {
            reply = 'नेविगेशन सहायता: गेट B (Gate B) के पास NE Restroom 105 में सबसे कम भीड़ है (2 मिनट से कम प्रतीक्षा समय)। कृपया गेट G वाले क्षेत्र से बचें।';
          } else if (query.includes('food') || query.includes('भूख') || query.includes('खाना') || query.includes('taco') || query.includes('pizza') || query.includes('भोजन')) {
            reply = 'भोजन सुझाव: गेट B पर World Cup Grill में केवल 5 मिनट की प्रतीक्षा है। गेट C पर Samba Street Tacos में भारी भीड़ है (22 मिनट की प्रतीक्षा)।';
          } else if (query.includes('gate') || query.includes('भीड़') || query.includes('प्रवेश') || query.includes('रास्ता')) {
            reply = 'गेट स्थिति: गेट B और गेट F बिल्कुल खाली हैं (5 मिनट से कम समय)। गेट G पर भारी भीड़ है, कृपया वैकल्पिक गेट H का उपयोग करें।';
          } else {
            reply = 'नमस्कार! एरिनाफ्لو एआई (ArenaFlow AI) सहायक में आपका स्वागत है। मैं आज स्टेडियम के किस क्षेत्र में आपकी सहायता कर सकता हूँ?';
          }
        } else if (language === 'Arabic') {
          if (query.includes('toilet') || query.includes('restroom') || query.includes('حمام') || query.includes('دورة') || query.includes('مرحاض')) {
            reply = 'توجيه الملاعب: أقرب دورة مياه شاغرة هي NE Restroom 105 عند البوابة B (وقت الانتظار أقل من دقيقتين). يرجى تجنب البوابة G المزدحمة.';
          } else if (query.includes('food') || query.includes('طعام') || query.includes('اكل') || query.includes('جائع') || query.includes('تاكو') || query.includes('شراب')) {
            reply = 'توصية الطعام: مطعم World Cup Grill عند البوابة B لديه انتظار 5 دقائق فقط. بينما Samba Street Tacos عند البوابة C مزدحم للغاية (22 دقيقة).';
          } else if (query.includes('gate') || query.includes('بوابة') || query.includes('ازدحام') || query.includes('مدخل') || query.includes('مخرج')) {
            reply = 'حالة البوابات: البوابات B و F فارغة تمامًا ومريحة (انتظار أقل من 5 دقائق). يرجى تجنب البوابة G واستخدام البوابة H كبديل سريع.';
          } else {
            reply = 'مرحباً بك في مساعد ملاعب كأس العالم ArenaFlow AI. كيف يمكنني مساعدتك في التنقل وتجنب الازدحام اليوم؟';
          }
        } else {
          // English (Default)
          if (query.includes('toilet') || query.includes('restroom') || query.includes('washroom') || query.includes('wc')) {
            reply = 'Navigation guidance: Nearest restroom with low wait times is NE Restroom 105 at Gate B (under 2 minutes wait). Avoid restrooms in Gate C and Gate G.';
          } else if (query.includes('food') || query.includes('eat') || query.includes('beer') || query.includes('taco') || query.includes('pizza') || query.includes('hungry')) {
            reply = 'Concession Suggestion: World Cup Grill at Gate B has only a 5-minute queue. Samba Street Tacos at Gate C is highly congested (22 minutes queue wait).';
          } else if (query.includes('gate') || query.includes('crowd') || query.includes('ingress') || query.includes('exit') || query.includes('traffic')) {
            reply = 'Gate Capacity Status: Gate B and Gate F are highly fluid (under 5 mins wait). Gate G is experiencing a critical load, please reroute to Gate H.';
          } else {
            reply = 'Hello! Welcome to the ArenaFlow AI multilingual assistant. Transit corridors and digital twin heatmaps are synced. Which gate are you heading to?';
          }
        }

        const modelMsg: ChatMessage = {
          id: `chat-${Date.now()}-m`,
          role: 'model',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language,
        };
        setChatHistory(prev => [...prev, modelMsg]);
        showToast('success', 'Fan assistant simulated dynamic routing response locally');
        setLoadingState(prev => ({ ...prev, chat: false }));
      }, 600);
      return;
    }

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
    if (useLocalFallback) {
      setState(getFallbackStadiumState());
      setRiskAssessment(null);
      showToast('success', 'Stadium digital twin local simulation synchronized to operational baseline');
      return;
    }

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

  const adaptedState = state ? adaptStadiumState(state, domain) : null;
  const adaptedRisk = riskAssessment ? adaptRiskAssessment(riskAssessment, domain) : null;
  const labels = DOMAIN_LABELS[domain];

  return (
    <div className="min-h-screen bg-app-bg text-app-text font-sans flex overflow-hidden selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200">
      
      {/* Skip to Content Link for Keyboard / Screen Reader Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-slate-950 focus:rounded-xl focus:font-extrabold focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        Skip to main content
      </a>

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
                    {labels.appName.split(' ')[0]} <span className="text-amber-400">{labels.appName.split(' ')[1]}</span>
                  </h1>
                  <span className="text-[9px] text-slate-400 font-medium tracking-wide">{labels.subHeader}</span>
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

          {/* Operational Domain Switcher */}
          {!sidebarCollapsed && (
            <div className="px-4 py-3 border-b border-app-border bg-slate-950/20">
              <label htmlFor="operational-domain-select" className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                🌐 Operational Domain
              </label>
              <select
                id="operational-domain-select"
                value={domain}
                onChange={(e) => {
                  const newDomain = e.target.value as OperationalDomain;
                  setDomain(newDomain);
                  showToast('success', `Switched to ${DOMAIN_LABELS[newDomain].appName} operational domain`);
                }}
                className="w-full bg-slate-900 border border-slate-850 text-slate-300 text-xs rounded-xl p-2 px-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-semibold"
              >
                <option value="stadium">🏟️ Stadium Operations</option>
                <option value="campus">🎓 Campus Operations</option>
                <option value="hospital">🏥 Hospital Operations</option>
              </select>
            </div>
          )}

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
                <span>{labels.location}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400 border-l border-slate-850 pl-4">
                <Tv className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>{labels.event}</span>
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
        <main id="main-content" className="flex-1 overflow-y-auto p-6 space-y-6" tabIndex={-1}>
          
          {loadingState.stadium && !state ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
              <p className="text-sm text-slate-400 font-mono">Synchronizing digital twin with telemetry servers...</p>
            </div>
          ) : adaptedState ? (
            <div className="space-y-6">
              
              {/* PAGE MODULE 1: Operations Dashboard */}
              {activeTab === 'dashboard' && (
                <div className="animate-fade-in">
                  <Dashboard
                    state={adaptedState}
                    risk={adaptedRisk}
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
                    zones={adaptedState.zones}
                    selectedZoneId={selectedZoneId}
                    onSelectZone={setSelectedZoneId}
                    onUpdateDensity={handleUpdateDensity}
                  />

                  {/* Gemini AI Risk Analyzer */}
                  <RiskAnalysis
                    assessment={adaptedRisk}
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
                  <VendorSync preps={adaptedState.vendorPreps} domain={domain} />
                </div>
              )}

              {/* PAGE MODULE 4: Concessions operations */}
              {activeTab === 'vendor' && (
                <div className="animate-fade-in">
                  <VendorSync preps={adaptedState.vendorPreps} domain={domain} />
                </div>
              )}

              {/* PAGE MODULE 5: Safety agents dispatcher */}
              {activeTab === 'safety' && (
                <div className="animate-fade-in">
                  <SafetyAgents
                    logs={adaptedState.agentLogs}
                    incidents={adaptedState.incidents}
                    zones={adaptedState.zones}
                    onTriggerIncident={handleTriggerIncident}
                    onReset={handleResetState}
                  />
                </div>
              )}

              {/* PAGE MODULE 6: Analytics Comparisons */}
              {activeTab === 'analytics' && (
                <div className="animate-fade-in">
                  <Analytics state={adaptedState} />
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
          <span>{labels.appName} Core Operations • {labels.event}</span>
          <span className="flex items-center gap-1.5 text-[10px]">
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            Designed for Campus & Hospital Queue Intelligence
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
