import { RiskAssessment } from '../types.js';
import { ShieldAlert, RefreshCw, Sun, Bus, ShieldCheck } from 'lucide-react';

interface RiskAnalysisProps {
  assessment: RiskAssessment | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function RiskAnalysis({ assessment, loading, onRefresh }: RiskAnalysisProps) {
  
  // Helper to color-code risk level
  const getRiskLevelStyles = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'LOW':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          fill: 'stroke-emerald-500',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          fill: 'stroke-amber-500',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
          fill: 'stroke-orange-500',
          text: 'text-orange-400',
          badge: 'bg-orange-500/20 text-orange-300'
        };
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          fill: 'stroke-rose-500',
          text: 'text-rose-400',
          badge: 'bg-rose-500/20 text-rose-300'
        };
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          fill: 'stroke-slate-500',
          text: 'text-slate-400',
          badge: 'bg-slate-500/20 text-slate-300'
        };
    }
  };

  const style = getRiskLevelStyles(assessment?.level || 'LOW');
  const score = assessment?.score || 0;
  
  // Calculate polar stroke for SVG circle gauge
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full justify-between">
      <div>
        {/* Title Block */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-display text-lg font-bold text-white tracking-wide">
              AI Risk Intelligence Engine
            </h3>
            <p className="text-xs text-slate-400">Gemini-powered real-time structural risk modeling</p>
          </div>
          <button
            id="refresh-risk-btn"
            onClick={onRefresh}
            disabled={loading}
            className={`p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer ${loading ? 'opacity-50' : ''}`}
            title="Recalculate safety model"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>

        {/* Dynamic Risk Gauge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* Radial Dial */}
          <div className="md:col-span-1 flex flex-col items-center justify-center p-4 bg-slate-950/30 rounded-xl border border-slate-900">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Background SVG Gauge */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className={`${style.fill} transition-all duration-1000 ease-out`}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-mono font-bold text-white">{score}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Risk Index</span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${style.badge}`}>
                {assessment?.level || 'LOW'} RISK
              </span>
            </div>
          </div>

          {/* AI Assessment Summary */}
          <div className="md:col-span-2 p-4 bg-slate-900/40 rounded-xl border border-slate-900 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block mb-1">
                Gemini Threat Analysis
              </span>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{assessment?.summary || 'Generating safety threat models...'}"
              </p>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-850 text-[11px] text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Full-scale venue parameters are within safe operation ranges.</span>
            </div>
          </div>
        </div>

        {/* Environmental Factoring */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-900/60 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200 mb-0.5">Weather Operations Factor</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {assessment?.weatherImpact || 'Syncing current heat index and cloud telemetry...'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-900/60 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200 mb-0.5">Transit & Ingress Pressure</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {assessment?.transitImpact || 'Syncing rail frequencies and highway congestion logs...'}
              </p>
            </div>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Actionable Tactical Recommendations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assessment?.recommendations?.map((rec, idx) => (
              <div key={idx} className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/60 text-[11px] text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 block mt-1.5 flex-shrink-0"></span>
                <p>{rec}</p>
              </div>
            )) || (
              <p className="text-xs text-slate-500">Formulating custom crowd dispersion recommendations...</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 mt-6 border-t border-slate-850 flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <span>SECURITY PROTOCOL: WorldCup-S26</span>
        <span>MODEL: GEMINI-3.5-FLASH</span>
      </div>
    </div>
  );
}
