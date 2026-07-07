import { StadiumZone } from '../types.js';
import { ShieldAlert, Users, Clock, Flame, Check } from 'lucide-react';

interface StadiumTwinProps {
  zones: StadiumZone[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
  onUpdateDensity: (zoneId: string, density: number) => void;
}

export default function StadiumTwin({
  zones,
  selectedZoneId,
  onSelectZone,
  onUpdateDensity,
}: StadiumTwinProps) {
  const selectedZone = zones.find(z => z.id === selectedZoneId);

  // Helper to map status to styling classes
  const getStatusColor = (status: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    switch (status) {
      case 'LOW':
        return {
          bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
          border: 'border-emerald-500/30',
          glow: 'shadow-emerald-500/20',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/10 hover:bg-amber-500/20',
          border: 'border-amber-500/30',
          glow: 'shadow-amber-500/20',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/10 hover:bg-orange-500/20',
          border: 'border-orange-500/30',
          glow: 'shadow-orange-500/20',
          text: 'text-orange-400',
          badge: 'bg-orange-500/20 text-orange-300'
        };
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/15 hover:bg-rose-500/25',
          border: 'border-rose-500/40 animate-pulse',
          glow: 'shadow-rose-500/30',
          text: 'text-rose-400',
          badge: 'bg-rose-500/30 text-rose-300'
        };
    }
  };

  // Pre-configured coordinate styles to lay out the stadium around the center pitch
  const getPositionClass = (zoneId: string) => {
    switch (zoneId) {
      // Outer ring
      case 'zone-a': return 'col-start-2 row-start-1'; // North
      case 'zone-b': return 'col-start-3 row-start-1'; // NE
      case 'zone-c': return 'col-start-3 row-start-2'; // East
      case 'zone-d': return 'col-start-3 row-start-3'; // SE
      case 'zone-e': return 'col-start-2 row-start-3'; // South
      case 'zone-f': return 'col-start-1 row-start-3'; // SW
      case 'zone-g': return 'col-start-1 row-start-2'; // West
      case 'zone-h': return 'col-start-1 row-start-1'; // NW
      // Inner Concourses
      case 'zone-i': return 'col-start-2 row-start-1 self-end translate-y-10 z-10 scale-90'; // LT North
      case 'zone-j': return 'col-start-2 row-start-3 self-start -translate-y-10 z-10 scale-90'; // LT South
      case 'zone-k': return 'col-start-3 row-start-2 justify-self-start -translate-x-10 z-10 scale-90'; // UT East
      case 'zone-l': return 'col-start-1 row-start-2 justify-self-end translate-x-10 z-10 scale-90'; // UT West
      default: return '';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visual Stadium Grid */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-wide">Stadium Digital Twin</h3>
              <p className="text-xs text-slate-400">Live crowd-density model mapping all 12 major entries & concourses</p>
            </div>
            <div className="flex gap-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span> Low (&lt;35%)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span> Med (35-55%)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 block"></span> High (55-75%)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 block animate-pulse"></span> Crit (&gt;75%)</span>
            </div>
          </div>

          {/* Isometric Stadium Board */}
          <div className="relative py-8 bg-slate-950/40 rounded-xl border border-slate-800/50 p-4 min-h-[380px] flex items-center justify-center">
            
            {/* The Stadium Ring Container */}
            <div className="grid grid-cols-3 grid-rows-3 gap-y-4 gap-x-6 w-full max-w-lg relative">
              
              {/* Central Soccer Field/Pitch */}
              <div className="col-start-2 row-start-2 rounded-lg stadium-pitch h-28 relative flex items-center justify-center shadow-2xl overflow-hidden">
                {/* Soccer Field Markings */}
                <div className="absolute inset-x-0 top-1/2 border-t border-white/20"></div>
                <div className="absolute w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                </div>
                <div className="absolute top-0 inset-x-8 h-4 border-x border-b border-white/10"></div>
                <div className="absolute bottom-0 inset-x-8 h-4 border-x border-t border-white/10"></div>
                
                <span className="text-[9px] font-display font-bold text-emerald-400/40 uppercase tracking-widest rotate-[-12deg] z-10 select-none">
                  FIFA 2026 Pitch
                </span>
              </div>

              {/* Map all 12 zones onto the circular coordinate grid */}
              {zones.map((zone) => {
                const style = getStatusColor(zone.status);
                const isSelected = selectedZoneId === zone.id;
                
                return (
                  <button
                    key={zone.id}
                    id={`stadium-zone-${zone.id}`}
                    onClick={() => onSelectZone(zone.id)}
                    aria-label={`Zone ${zone.id.split('-')[1].toUpperCase()} (${zone.name}), current density ${zone.density} percent, queue wait time ${zone.queueTimeMin} minutes`}
                    className={`
                      ${getPositionClass(zone.id)} 
                      ${style.bg} ${style.border} border-2 rounded-xl p-2.5
                      transition-all duration-300 flex flex-col justify-between text-left
                      cursor-pointer focus:outline-none h-24 shadow-lg
                      ${isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-105 z-20' : 'hover:scale-[1.02]'}
                    `}
                  >
                    <div className="w-full flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {zone.id.split('-')[1].toUpperCase()}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${style.badge}`}>
                        {zone.density}%
                      </span>
                    </div>

                    <div className="mt-1">
                      <h4 className="text-[11px] font-display font-semibold text-slate-100 truncate leading-tight">
                        {zone.name.replace(' (North Entry)', '').replace(' (North-East Entry)', '').replace(' (East Entry)', '').replace(' (South-East Entry)', '').replace(' (South Entry)', '').replace(' (South-West Entry)', '').replace(' (West Entry)', '').replace(' (North-West Entry)', '')}
                      </h4>
                      <p className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 inline text-amber-400/80" /> {zone.queueTimeMin}m Wait
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Interactive Simulation Concept:</strong> Click any zone button above, then use the right-side control panel's density slider to inject heavy crowds. Exceeding <strong>55% density</strong> instantly triggers the Multi-Agent safety response.
          </p>
        </div>
      </div>

      {/* Zone Control and Details Panel */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-white tracking-wide mb-1">
            Zone Intelligence Desk
          </h3>
          <p className="text-xs text-slate-400 mb-4">Select a zone on the digital twin to inspect amenities & live queues</p>

          {selectedZone ? (
            <div className="space-y-5 animate-fade-in">
              {/* Header Details */}
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-display text-base font-bold text-white">{selectedZone.name}</h4>
                    <p className="text-[11px] text-slate-400">{selectedZone.location}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(selectedZone.status).badge}`}>
                    {selectedZone.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-850">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase leading-none">Crowd count</p>
                      <p className="text-xs font-mono font-bold text-white mt-1">
                        {selectedZone.currentCount} / {selectedZone.capacity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase leading-none">Queue time</p>
                      <p className="text-xs font-mono font-bold text-white mt-1">
                        {selectedZone.queueTimeMin} Mins
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Simulation Slider */}
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="crowd-density-slider" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-400" /> Simulate Crowd Density
                  </label>
                  <span className="text-sm font-mono font-bold text-amber-400">{selectedZone.density}%</span>
                </div>
                <input
                  id="crowd-density-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={selectedZone.density}
                  onChange={(e) => onUpdateDensity(selectedZone.id, parseInt(e.target.value))}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={selectedZone.density}
                  className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Empty</span>
                  <span className="text-rose-400/80 font-bold">55% Trigger</span>
                  <span>Surge</span>
                </div>
              </div>

              {/* Amenities in this Zone */}
              <div className="space-y-3">
                <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Amenities inside Zone</h5>

                {/* Concessions */}
                <div className="space-y-2">
                  {selectedZone.amenities.concessions.map((c) => (
                    <div key={c.id} className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/40 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-medium text-white">{c.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Menu: {c.items.join(', ')} • {c.distanceM}m away
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.waitTimeMin > 15 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {c.waitTimeMin}m Wait
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Restrooms */}
                <div className="space-y-2">
                  {selectedZone.amenities.toilets.map((t) => (
                    <div key={t.id} className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/40 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-medium text-white">{t.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Restroom • {t.distanceM}m away
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                          {t.waitTimeMin}m Wait
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Merchandise */}
                {selectedZone.amenities.merch.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/40 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-medium text-white">{m.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Official FIFA Souvenirs • {m.distanceM}m away</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">
                        {m.waitTimeMin}m Wait
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl text-center p-4">
              <Users className="w-8 h-8 text-slate-500 mb-2 animate-bounce" />
              <p className="text-sm text-slate-300 font-medium">No Zone Selected</p>
              <p className="text-xs text-slate-500 max-w-[200px] mt-1">
                Click any zone of the Stadium Twin heatmap on the left to inspect its live data
              </p>
            </div>
          )}
        </div>

        {selectedZone && (
          <div className="pt-4 border-t border-slate-850 flex justify-between items-center text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Automatic Sync
            </span>
            <span className="text-amber-400 font-mono font-bold">LIVE STADIUM DB</span>
          </div>
        )}
      </div>
    </div>
  );
}
