import React from 'react';
import { StadiumState } from '../types.js';
import { BarChart3, Clock, AlertTriangle, TrendingUp, Users, ShieldCheck, BarChart } from 'lucide-react';
import { DensityChart } from './Analytics/Charts.js';

interface AnalyticsProps {
  state: StadiumState;
}

export default function Analytics({ state }: AnalyticsProps) {
  const zones = state.zones;

  // Find highest density zone
  const highestDensityZone = [...zones].sort((a, b) => b.density - a.density)[0];

  // Find lowest queue time zone
  const lowestWaitZone = [...zones].sort((a, b) => a.queueTimeMin - b.queueTimeMin)[0];

  // Calculate stats
  const avgWaitTime = Math.round(
    zones.reduce((sum, z) => sum + z.queueTimeMin, 0) / (zones.length || 1)
  );

  const criticalZoneCount = zones.filter(z => z.density >= 70).length;

  return (
    <div className="space-y-6">
      
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold font-mono">Highest Load Sector</span>
            <p className="text-sm font-bold text-white mt-0.5 truncate max-w-[150px]">{highestDensityZone?.name || 'Gate A'}</p>
            <span className="text-xs text-rose-400 font-mono font-bold">{highestDensityZone?.density || 0}% Density</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold font-mono">Optimal Sector</span>
            <p className="text-sm font-bold text-white mt-0.5 truncate max-w-[150px]">{lowestWaitZone?.name || 'Gate B'}</p>
            <span className="text-xs text-emerald-400 font-mono font-bold">{lowestWaitZone?.density || 0}% Density</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold font-mono">Average Queue wait</span>
            <p className="text-sm font-bold text-white mt-0.5">{avgWaitTime} Minutes</p>
            <span className="text-[10px] text-slate-400">Gate wait flow metric</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold font-mono">Critical Surging Sectors</span>
            <p className="text-sm font-bold text-white mt-0.5">{criticalZoneCount} Zones</p>
            <span className="text-xs text-rose-400 font-bold font-mono">Density &gt; 70%</span>
          </div>
        </div>

      </div>

      {/* Real-time Canvas density bento box panel */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <BarChart className="w-4 h-4 text-amber-500" />
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Live Real-time Density Telemetry</h3>
            </div>
            <p className="text-xs text-slate-400">High performance Canvas rendering of live stadium crowd distribution and density scales</p>
          </div>
          <span className="px-2.5 py-1 text-[9px] font-mono font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full uppercase tracking-wider animate-pulse">
            Realtime Engine Active
          </span>
        </div>

        <div className="bg-slate-950 p-2 rounded-xl">
          <DensityChart data={zones} />
        </div>
      </div>


      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Crowd Density Comparative Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display text-base font-bold text-white">Live Crowd Density comparison</h3>
                <p className="text-xs text-slate-400">Current crowd occupancy percent compared across all 12 zones</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">Live Telemetry</span>
            </div>

            {/* SVG Visual Bar Chart */}
            <div className="space-y-3">
              {zones.map((zone) => (
                <div key={zone.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold truncate max-w-[200px]">{zone.name}</span>
                    <span className={`font-mono font-bold ${
                      zone.density >= 75 ? 'text-rose-400' : zone.density >= 55 ? 'text-orange-400' : 'text-slate-400'
                    }`}>{zone.density}%</span>
                  </div>
                  
                  {/* Progress bar container */}
                  <div className="w-full bg-slate-950/60 h-2.5 rounded-full overflow-hidden border border-slate-900">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        zone.density >= 75 
                          ? 'bg-gradient-to-r from-rose-600 to-rose-400 animate-pulse' 
                          : zone.density >= 55 
                          ? 'bg-gradient-to-r from-orange-500 to-amber-400' 
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      }`}
                      style={{ width: `${zone.density}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-850 text-[10px] text-slate-500 font-mono mt-6">
            UPDATES EVERY 2.5 SECONDS • SECTOR CAPACITIES UP TO 15,000 FANS
          </div>
        </div>

        {/* Chart 2: Concession wait times Comparison */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display text-base font-bold text-white">Average Gate Wait Times (Mins)</h3>
                <p className="text-xs text-slate-400">Turnstile processing friction and queue queue delays</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">Line Analytics</span>
            </div>

            {/* SVG-based vertical chart bars or beautifully designed horizontal flow gauges */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {zones.map((zone) => (
                <div key={zone.id} className="p-3 bg-slate-950/40 rounded-xl border border-slate-900/80 flex flex-col justify-between h-24">
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {zone.id.split('-')[1].toUpperCase()}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      zone.queueTimeMin > 20 ? 'bg-rose-500 animate-pulse' : zone.queueTimeMin > 10 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                  </div>

                  <div className="mt-2">
                    <p className="text-xl font-mono font-extrabold text-white">
                      {zone.queueTimeMin}<span className="text-xs font-medium text-slate-400"> min</span>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {zone.name.replace(' (North Entry)', '').replace(' (East Entry)', '').replace(' (South Entry)', '').replace(' (West Entry)', '')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Optimization Insight Box */}
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
              <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Gemini Load Optimization Insight:</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Direct routing plans currently active. Suggested pathfinding overrides sent via digital signage has kept average wait times below 15 minutes across 85% of operational zones.
                </p>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-850 text-[10px] text-slate-500 font-mono mt-6">
            CAPACITY THROUGHPUT: 220 ENTRY EVENTS / MINUTE
          </div>
        </div>

      </div>

    </div>
  );
}
