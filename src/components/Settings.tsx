import React, { useState } from 'react';
import { Shield, User, Settings2, Trash2, ShieldAlert, History, KeyRound } from 'lucide-react';

interface SettingsProps {
  onReset: () => void;
}

export default function Settings({ onReset }: SettingsProps) {
  // Local profile state
  const [profile, setProfile] = useState({
    name: 'Venue Operations Commander',
    email: 'ops.lead@fifa2026.org',
    role: 'Operations Super Admin',
    organization: 'FIFA World Cup 2026 - NYNJ Host Committee',
  });

  const [thresholds, setThresholds] = useState({
    densityWarning: 55,
    densityCritical: 75,
    refreshInterval: 2.5,
    autoMitigation: true,
  });

  const [savedMessage, setSavedMessage] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage('Profile settings saved successfully.');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage('Crowd alert thresholds updated.');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  // Simulated static activity logs
  const sessionActivities = [
    { time: '01:41 AM', action: 'Digital Twin Telemetry Synced', category: 'SYSTEM' },
    { time: '01:38 AM', action: 'AI Concessions Prep Recommendation Recalculated', category: 'CATERING' },
    { time: '01:35 AM', action: 'Active Signage Dispatch Override Executed (Gate C)', category: 'MITIGATION' },
    { time: '01:12 AM', action: 'Operations Supervisor Authenticated', category: 'SECURITY' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Settings Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Profile management */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-display text-base font-bold text-white">Operations Profile</h3>
                <p className="text-xs text-slate-400">Manage account credentials and tournament roles</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-slate-950/40 border border-slate-900 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Email address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-slate-950/40 border border-slate-900 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Assigned Role</label>
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="w-full bg-slate-950/20 border border-slate-900 text-xs text-slate-500 rounded-lg p-2.5 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Organization</label>
                  <input
                    type="text"
                    value={profile.organization}
                    onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                    className="w-full bg-slate-950/40 border border-slate-900 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-2 px-4 rounded-xl transition-all cursor-pointer"
                >
                  Save Profile Settings
                </button>
              </div>
            </form>
          </div>

          {savedMessage && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-medium animate-fade-in">
              {savedMessage}
            </div>
          )}
        </div>

        {/* System Threshold Settings */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-display text-base font-bold text-white">System Config & Alarm thresholds</h3>
              <p className="text-xs text-slate-400">Configure AI warnings levels and dashboard telemetry</p>
            </div>
          </div>

          <form onSubmit={handleSaveThresholds} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Warning Threshold (%)</label>
                <input
                  type="number"
                  value={thresholds.densityWarning}
                  onChange={(e) => setThresholds({ ...thresholds, densityWarning: Number(e.target.value) })}
                  className="w-full bg-slate-950/40 border border-slate-900 text-xs text-white rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Critical Threshold (%)</label>
                <input
                  type="number"
                  value={thresholds.densityCritical}
                  onChange={(e) => setThresholds({ ...thresholds, densityCritical: Number(e.target.value) })}
                  className="w-full bg-slate-950/40 border border-slate-900 text-xs text-white rounded-lg p-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Telemetry Refresh Interval (Secs)</label>
              <input
                type="number"
                step="0.5"
                value={thresholds.refreshInterval}
                onChange={(e) => setThresholds({ ...thresholds, refreshInterval: Number(e.target.value) })}
                className="w-full bg-slate-950/40 border border-slate-900 text-xs text-white rounded-lg p-2.5 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-300">Auto-Mitigation Mode</p>
                <p className="text-[10px] text-slate-500">Autonomous supervisor agents dispatch sign changes automatically</p>
              </div>
              <input
                type="checkbox"
                checked={thresholds.autoMitigation}
                onChange={(e) => setThresholds({ ...thresholds, autoMitigation: e.target.checked })}
                className="w-4 h-4 text-amber-500 bg-slate-900 border-slate-800 rounded focus:ring-amber-500 cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-2 px-4 rounded-xl transition-all cursor-pointer"
              >
                Save Operational Config
              </button>

              <button
                type="button"
                onClick={onReset}
                className="border border-slate-850 hover:bg-slate-900 hover:text-white text-slate-400 text-xs font-bold py-2 px-4 rounded-xl transition-all cursor-pointer"
              >
                Reset Simulation State
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* Admin Session Audit Log & System Reset Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Session Audit Ledger */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-display text-base font-bold text-white">Live Session Audit Log</h3>
              <p className="text-xs text-slate-400">Security-logged actions taken in this browser session</p>
            </div>
          </div>

          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            {sessionActivities.map((act, index) => (
              <div key={index} className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg flex justify-between items-center gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-300">{act.action}</p>
                  <span className="text-[9px] text-slate-500 uppercase font-mono">{act.category}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Reset & Evacuation Checklist Mock */}
        <div className="glass-panel p-6 rounded-2xl border-rose-500/10 flex flex-col justify-between h-[254px]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <div>
                <h3 className="font-display text-base font-bold text-white">Emergency Operations Center</h3>
                <p className="text-xs text-slate-400">Direct overriding commands for tournament safety</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-normal mb-4">
              In the event of a structural threat, power malfunction, or stampede warning, you can initiate stadium-wide digital sign evacuations or completely wipe live states.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => alert('Initiating simulated dynamic signage evacuation route!')}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer text-center"
            >
              Simulate Wide Evacuation
            </button>
            <button
              onClick={onReset}
              className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer text-center"
            >
              Reset World Cup Simulation
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
