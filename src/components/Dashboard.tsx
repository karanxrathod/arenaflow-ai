import React, { useEffect, useRef } from 'react';
import { StadiumState, RiskAssessment } from '../types.js';
import { useLanguage } from '../context/LanguageContext.js';
import { SimulationEngine } from '../services/SimulationEngine.js';
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  Clock, 
  CloudSun, 
  Bus, 
  TrendingUp, 
  Trophy, 
  Bell, 
  ShieldCheck, 
  Play 
} from 'lucide-react';

interface DashboardProps {
  state: StadiumState;
  risk: RiskAssessment | null;
  onNavigate: (tab: 'twin' | 'fan' | 'safety' | 'analytics' | 'settings') => void;
  onSimulateCriticalSurge: () => void;
}

export default function Dashboard({ state, risk, onNavigate, onSimulateCriticalSurge }: DashboardProps) {
  const { t } = useLanguage();
  
  const simEngine = useRef<SimulationEngine | null>(null);

  useEffect(() => {
    simEngine.current = new SimulationEngine({
      updateInterval: 12000,
      densityVariation: 8,
      zoneCount: 12
    });
    simEngine.current.start();

    return () => {
      simEngine.current?.stop();
    };
  }, []);
  
  // Calculate average stadium density
  const totalZones = state.zones.length;
  const avgDensity = Math.round(
    state.zones.reduce((sum, zone) => sum + zone.density, 0) / (totalZones || 1)
  );

  // Active warning/critical incidents
  const activeIncidentsCount = state.incidents.filter(i => i.status !== 'RESOLVED').length;

  // Active surge concessions count
  const surgeConcessionsCount = state.vendorPreps.filter(vp => vp.currentDensity >= 55).length;

  // Render status badge style for overall load
  const getLoadLevelColor = (density: number) => {
    if (density < 35) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (density < 55) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (density < 75) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse';
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Core Metric Cards (Fifa Gold Theme Styled) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Attendance */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">{t('totalAttendance')}</p>
              <h3 className="text-2xl font-display font-extrabold text-white mt-1.5">
                {state.zones.reduce((sum, z) => sum + z.currentCount, 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" /> 
                <span>Capacity limit: <strong>82,500</strong></span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Metric 2: Live System Load */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">{t('averageDensity')}</p>
              <h3 className="text-2xl font-display font-extrabold text-white mt-1.5">
                {avgDensity}%
              </h3>
              <p className="text-[10px] mt-1">
                <span className={`px-1.5 py-0.5 rounded font-bold font-mono uppercase text-[9px] ${getLoadLevelColor(avgDensity)}`}>
                  {avgDensity < 35 ? 'Optimized' : avgDensity < 55 ? 'Moderate' : 'Heavy'} Load
                </span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Metric 3: Active Incident Alerter */}
        <div className={`glass-panel p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-amber-500/30 ${activeIncidentsCount > 0 ? 'border-rose-500/30' : ''}`}>
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-bl-full"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">{t('activeAlerts')}</p>
              <h3 className="text-2xl font-display font-extrabold text-white mt-1.5">
                {activeIncidentsCount}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                {activeIncidentsCount > 0 ? (
                  <span className="text-rose-400 font-bold animate-pulse">● Requiring mitigation dispatch</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">✓ Venue is fully secure</span>
                )}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeIncidentsCount > 0 ? 'bg-rose-500/15 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Metric 4: AI Agent Loop Latency */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">{t('aiResponseTime')}</p>
              <h3 className="text-2xl font-display font-extrabold text-white mt-1.5">
                4.2s
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Routing accuracy: <strong className="text-emerald-400">99.8%</strong>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Match Telemetry & Twin Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Col 1 & 2: Tournament Timeline & System Health overview */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Match Scoreboard and Crowd Flow Simulation widget */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-slate-850 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Live Match Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">
                  {t('liveMatchday') || 'Live Matchday'}
                </span>
                <h4 className="font-display text-base font-bold text-white mt-1">USA vs MEXICO</h4>
                <p className="text-xs text-slate-400">Round of 16 • 75' Second Half</p>
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase font-bold block mb-1">USA</span>
                <span className="text-3xl font-display font-extrabold text-white">2</span>
              </div>
              <div className="px-3 py-1 bg-slate-950 rounded text-xs font-mono font-bold text-amber-400">
                74:18
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase font-bold block mb-1">MEX</span>
                <span className="text-3xl font-display font-extrabold text-white">1</span>
              </div>
            </div>

            {/* Simulation Hot Trigger */}
            <div className="text-center md:text-right">
              <button
                id="critical-surge-simulation-btn"
                onClick={onSimulateCriticalSurge}
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs py-2 px-4 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> {t('criticalSurge') || 'Inject Crowd Surge Simulation'}
              </button>
              <p className="text-[10px] text-slate-400 mt-1.5">Increases random gates' load to trigger multi-agent loop</p>
            </div>

          </div>

          {/* Quick Module Router Cards (Bento Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-900 flex flex-col justify-between h-40">
              <div>
                <span className="text-xl">🏟️</span>
                <h4 className="font-display text-sm font-bold text-white mt-3">Digital Twin Heatmap</h4>
                <p className="text-xs text-slate-400 mt-1">Monitor the live crowd density model across 12 sectors.</p>
              </div>
              <button
                onClick={() => onNavigate('twin')}
                className="text-xs text-amber-400 font-semibold text-left flex items-center gap-1 hover:underline cursor-pointer"
              >
                Open CommandCenter →
              </button>
            </div>

            <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-900 flex flex-col justify-between h-40">
              <div>
                <span className="text-xl">💬</span>
                <h4 className="font-display text-sm font-bold text-white mt-3">Fan Chat Concierge</h4>
                <p className="text-xs text-slate-400 mt-1">Multi-lingual routing concierge answering path queries.</p>
              </div>
              <button
                onClick={() => onNavigate('fan')}
                className="text-xs text-amber-400 font-semibold text-left flex items-center gap-1 hover:underline cursor-pointer"
              >
                Open Assistant →
              </button>
            </div>

            <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-900 flex flex-col justify-between h-40">
              <div>
                <span className="text-xl">🤖</span>
                <h4 className="font-display text-sm font-bold text-white mt-3">Multi-Agent Safety</h4>
                <p className="text-xs text-slate-400 mt-1">Supervisor-Specialist safety mitigating high load zones.</p>
              </div>
              <button
                onClick={() => onNavigate('safety')}
                className="text-xs text-amber-400 font-semibold text-left flex items-center gap-1 hover:underline cursor-pointer"
              >
                Open Safety Agent →
              </button>
            </div>

          </div>

          {/* System status details */}
          <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl">
            <h4 className="font-display text-sm font-bold text-white mb-3">Live System Feeds</h4>
            
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs p-2.5 bg-slate-950/20 rounded border border-slate-900">
                <span className="text-slate-400">🏟️ Stadium Operational Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse block"></span> 100% ONLINE
                </span>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 bg-slate-950/20 rounded border border-slate-900">
                <span className="text-slate-400">🤖 Autonomous Mitigation Watchdog</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block"></span> ENGAGED
                </span>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 bg-slate-950/20 rounded border border-slate-900">
                <span className="text-slate-400">📡 Concessions Supply Predictor</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block"></span> ACTIVE
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Col 3: Side Panel (Weather, Transit Load, Incidents Quick Widget) */}
        <div className="space-y-6">
          
          {/* Weather Widget */}
          <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-900 flex gap-4">
            <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20 flex items-center justify-center flex-shrink-0">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Live Weather</span>
              <h4 className="font-display text-sm font-bold text-white mt-0.5">{state.weather.temp}</h4>
              <p className="text-xs text-slate-400 leading-normal mt-0.5">{state.weather.condition}</p>
            </div>
          </div>

          {/* Transit Widget */}
          <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Transit Telemetry</span>
                <h4 className="font-display text-sm font-bold text-white">Load Level: <span className="text-orange-400">{state.transit.loadLevel}</span></h4>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg">
                <p className="font-bold text-slate-300">Subway & Rail Line</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{state.transit.subwayStatus}</p>
              </div>
              <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg">
                <p className="font-bold text-slate-300">Shuttle Bus Loop</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{state.transit.shuttleStatus}</p>
              </div>
              <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg">
                <p className="font-bold text-slate-300">Parking Terminals</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{state.transit.parkingStatus}</p>
              </div>
            </div>
          </div>

          {/* Quick Active Alerts List */}
          <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-900">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-500 animate-swing" /> Operations Ledger
              </h4>
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">
                {state.incidents.length} Live
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {state.incidents.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No active anomalies recorded.</p>
              ) : (
                state.incidents.slice(0, 4).map((inc) => (
                  <div key={inc.id} className={`p-2.5 rounded-lg border text-[11px] flex flex-col gap-1 ${
                    inc.severity === 'CRITICAL' 
                      ? 'bg-rose-500/5 border-rose-500/20 text-rose-300' 
                      : 'bg-amber-500/5 border-amber-500/10 text-amber-300'
                  }`}>
                    <div className="flex justify-between items-center">
                      <strong className="truncate max-w-[120px]">{inc.zoneName}</strong>
                      <span className="text-[8px] font-mono uppercase opacity-80">{inc.timestamp}</span>
                    </div>
                    <p className="text-slate-300 leading-tight truncate">{inc.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
