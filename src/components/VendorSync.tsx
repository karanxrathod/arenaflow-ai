import { VendorPrep } from '../types.js';
import { Store, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { OperationalDomain, DOMAIN_LABELS } from '../utils/domainAdapter.js';

interface VendorSyncProps {
  preps: VendorPrep[];
  domain?: OperationalDomain;
}

export default function VendorSync({ preps, domain = 'stadium' }: VendorSyncProps) {
  const labels = DOMAIN_LABELS[domain];
  
  const getDemandBadge = (demand: 'LOW' | 'MODERATE' | 'HIGH' | 'SURGING') => {
    switch (demand) {
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'MODERATE':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'HIGH':
        return 'bg-orange-500/15 text-orange-400 border border-orange-500/30';
      case 'SURGING':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse';
    }
  };

  const getAlertPriority = (density: number) => {
    if (density >= 75) return 'CRITICAL SURGE';
    if (density >= 55) return 'HIGH SURGE ALERT';
    return null;
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-[520px] justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-white tracking-wide flex items-center gap-1.5">
              <Store className="w-5 h-5 text-amber-500" /> {labels.vendorLabel} Supply & Operations Sync
            </h3>
            <p className="text-xs text-slate-400">Live predictive crowd-surge catering models for concourse concessionaires</p>
          </div>
        </div>

        {/* Highlighted Alerts Bar */}
        {preps.some(p => p.currentDensity >= 55) ? (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-4 text-[11px] text-rose-300 flex items-start gap-2.5 max-h-[100px] overflow-y-auto">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5 animate-bounce" />
            <div>
              <span className="font-bold">ACTIVE SURGE ALERTS: </span>
              {preps
                .filter(p => p.currentDensity >= 55)
                .map((p, idx, arr) => (
                  <span key={p.zoneId}>
                    {p.concessionName} ({p.currentDensity}% density, Prep {p.refreshmentsToPrep} {labels.drinkLabel} / {p.tacosToPrep} {labels.foodLabel})
                    {idx < arr.length - 1 ? ' • ' : ''}
                  </span>
                ))}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl mb-4 text-[11px] text-emerald-300 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>All concessions demand profiles are standard. No preparation surges required.</span>
          </div>
        )}

        {/* Vendors Grid */}
        <div className="space-y-2.5 overflow-y-auto max-h-[310px] pr-1 font-sans">
          {preps.map((p) => {
            const alertText = getAlertPriority(p.currentDensity);
            return (
              <div
                key={p.zoneId}
                id={`vendor-card-${p.zoneId}`}
                className={`p-3.5 rounded-xl border transition-all ${
                  p.currentDensity >= 75
                    ? 'bg-rose-500/5 border-rose-500/30'
                    : p.currentDensity >= 55
                    ? 'bg-orange-500/5 border-orange-500/20'
                    : 'bg-slate-900/40 border-slate-900/60'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {p.concessionName}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Concourse: {p.zoneName} • Density: <span className="font-semibold text-slate-300">{p.currentDensity}%</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${getDemandBadge(p.predictedDemand)}`}>
                      {p.predictedDemand} DEMAND
                    </span>
                    {alertText && (
                      <span className="text-[8px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1 rounded uppercase tracking-wider animate-pulse">
                        {alertText}
                      </span>
                    )}
                  </div>
                </div>

                {/* Catering Targets */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-850/40 text-[11px]">
                  <div className="bg-slate-950/40 p-1.5 rounded-lg border border-slate-900 flex flex-col justify-center text-center font-mono">
                    <span className="text-[9px] text-slate-400 uppercase leading-none block mb-1 font-sans">{labels.drinkLabel}</span>
                    <span className="font-mono font-bold text-white">
                      {p.refreshmentsToPrep} Units
                    </span>
                  </div>

                  <div className="bg-slate-950/40 p-1.5 rounded-lg border border-slate-900 flex flex-col justify-center text-center font-mono">
                    <span className="text-[9px] text-slate-400 uppercase leading-none block mb-1 font-sans">{labels.foodLabel}</span>
                    <span className="font-mono font-bold text-white">
                      {p.tacosToPrep} Units
                    </span>
                  </div>

                  <div className="bg-slate-950/40 p-1.5 rounded-lg border border-slate-900 flex flex-col justify-center text-center font-mono">
                    <span className="text-[9px] text-slate-400 uppercase leading-none block mb-1 font-sans">{labels.extraStaffLabel}</span>
                    <span className={`font-mono font-bold ${p.additionalStaffRecommended > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {p.additionalStaffRecommended > 0 ? `+${p.additionalStaffRecommended} Ops` : 'Optimal'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-850 flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <span className="flex items-center gap-1">
          <ShoppingBag className="w-3 h-3 text-slate-500" /> CATERING INVENTORY ENGINE
        </span>
        <span>{labels.appName.toUpperCase()} SPECIALIST</span>
      </div>
    </div>
  );
}
