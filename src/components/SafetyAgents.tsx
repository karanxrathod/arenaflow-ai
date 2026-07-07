import { useState } from 'react';
import { AgentLog, Incident, StadiumZone } from '../types.js';
import { Shield, Radio, Terminal, Send, AlertTriangle, RefreshCw } from 'lucide-react';

interface SafetyAgentsProps {
  logs: AgentLog[];
  incidents: Incident[];
  zones: StadiumZone[];
  onTriggerIncident: (zoneId: string, severity: 'INFO' | 'WARNING' | 'CRITICAL', message: string) => void;
  onReset: () => void;
}

export default function SafetyAgents({
  logs,
  incidents,
  zones,
  onTriggerIncident,
  onReset,
}: SafetyAgentsProps) {
  const [targetZoneId, setTargetZoneId] = useState(zones[0]?.id || '');
  const [severity, setSeverity] = useState<'INFO' | 'WARNING' | 'CRITICAL'>('WARNING');
  const [customMsg, setCustomMsg] = useState('');

  const activeGates = zones.filter(z => z.id.startsWith('zone-'));

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    onTriggerIncident(targetZoneId, severity, customMsg);
    setCustomMsg('');
  };

  const getAgentStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'PROCESSING':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse';
      case 'ALERT':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-bounce';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'WARNING':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      default:
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Module 4: Multi-Agent Command Logs */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col h-[520px] justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-wide flex items-center gap-1.5">
                <Terminal className="w-5 h-5 text-amber-500" /> Multi-Agent Security Core
              </h3>
              <p className="text-xs text-slate-400">Supervisor-Specialist autonomous safety mitigation console</p>
            </div>
            
            <button
              onClick={onReset}
              className="text-xs flex items-center gap-1 text-slate-400 hover:text-white border border-slate-800 p-1 px-2.5 rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset State
            </button>
          </div>

          {/* Agents Status Overview Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex flex-col items-center justify-center text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase leading-none block mb-1">Supervisor</span>
              <span className="text-[10px] font-semibold text-slate-200">Task Delegation</span>
              <span className="text-[9px] font-mono mt-1 text-emerald-400">● Active</span>
            </div>
            <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex flex-col items-center justify-center text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase leading-none block mb-1">Analysis Agent</span>
              <span className="text-[10px] font-semibold text-slate-200">Flow & Gate Analyst</span>
              <span className="text-[9px] font-mono mt-1 text-emerald-400">● Active</span>
            </div>
            <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex flex-col items-center justify-center text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase leading-none block mb-1">Mitigation Agent</span>
              <span className="text-[10px] font-semibold text-slate-200">Dynamic Signage</span>
              <span className="text-[9px] font-mono mt-1 text-emerald-400">● Active</span>
            </div>
          </div>

          {/* Live Agent Logs Feed */}
          <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-900/30 border border-slate-900/50 rounded-lg flex items-start gap-2.5">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 uppercase ${getAgentStatusBadge(log.status)}`}>
                  {log.agentName.split(' ')[0]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-200 leading-tight font-sans">
                    {log.message}
                  </p>
                  <span className="text-[9px] text-slate-500 font-mono block mt-1">{log.timestamp} • State: {log.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-850 flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-amber-500" /> AUTONOMOUS DISPATCH SYSTEM
          </span>
          <span>TELEMETRY STABLE</span>
        </div>
      </div>

      {/* Incident Log & Manual Dispatch Controls */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col h-[520px] justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-white tracking-wide flex items-center gap-1.5">
            <Shield className="w-5 h-5 text-amber-500" /> Security Dispatch Desk
          </h3>
          <p className="text-xs text-slate-400 mb-4">Simulate security anomalies to watch supervisor agents execute mitigations</p>

          {/* Incident reporting form */}
          <form onSubmit={handleDispatch} className="space-y-3 mb-5 p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">Trigger New Operational Event</span>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="incident-target-zone" className="text-[10px] text-slate-400 font-bold block mb-1">Target Zone</label>
                <select
                  id="incident-target-zone"
                  value={targetZoneId}
                  onChange={(e) => setTargetZoneId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  {activeGates.map(g => (
                    <option key={g.id} value={g.id}>{g.name.replace(' (North Entry)', '').replace(' (East Entry)', '').replace(' (South Entry)', '').replace(' (West Entry)', '')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="incident-severity" className="text-[10px] text-slate-400 font-bold block mb-1">Severity</label>
                <select
                  id="incident-severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="INFO">Info Event</option>
                  <option value="WARNING">Warning</option>
                  <option value="CRITICAL">Critical Threat</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="incident-description" className="text-[10px] text-slate-400 font-bold block mb-1">Incident Description</label>
              <input
                id="incident-description"
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="e.g. Heavy bottle-neck at Ticket Scanner B"
                className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded p-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={!customMsg.trim()}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold py-1.5 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Dispatch Custom Incident
            </button>
          </form>

          {/* Active Incident List */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Live Incident Ledger</span>
            <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
              {incidents.length === 0 ? (
                <div className="p-3 text-center text-[11px] text-slate-500 border border-dashed border-slate-850 rounded-lg">
                  No active incidents recorded in this session.
                </div>
              ) : (
                incidents.map((inc) => (
                  <div key={inc.id} className={`p-3 rounded-lg border flex flex-col justify-between ${getSeverityColor(inc.severity)}`}>
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        <p className="text-[11px] font-bold text-white flex items-center gap-1 leading-tight">
                          <AlertTriangle className="w-3.5 h-3.5" /> {inc.zoneName}
                        </p>
                        <p className="text-[10px] text-slate-300 mt-0.5 leading-tight">{inc.message}</p>
                      </div>
                      <span className="text-[8px] font-mono font-bold bg-white/10 px-1 py-0.5 rounded border border-white/10">
                        {inc.status}
                      </span>
                    </div>

                    {inc.mitigationPlan && (
                      <div className="mt-2 p-1.5 bg-slate-950/40 rounded border border-white/5 text-[9px] text-slate-300">
                        <span className="font-bold text-emerald-400">Agent Mitigation:</span> {inc.mitigationPlan}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-850 text-right text-[10px] text-slate-500 font-mono">
          <span>STADIUM OPERATIONS LOG V2.6</span>
        </div>
      </div>
    </div>
  );
}
