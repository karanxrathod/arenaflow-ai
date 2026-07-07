import React from 'react';
import { motion } from 'motion/react';

export const LoadingSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Page Title skeleton */}
      <div className="h-8 bg-slate-800/60 rounded-xl w-1/4 animate-pulse border border-slate-800/30"></div>
      
      {/* 4-Column Metric Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900 border border-slate-850 rounded-2xl p-5 h-26 flex flex-col justify-between animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-2/3">
                <div className="h-3.5 bg-slate-800/70 rounded w-1/2"></div>
                <div className="h-7 bg-slate-800 rounded w-4/5"></div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-850"></div>
            </div>
            <div className="h-2.5 bg-slate-850 rounded w-3/4 mt-2"></div>
          </div>
        ))}
      </div>

      {/* Grid Cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 h-80 animate-pulse lg:col-span-2 space-y-4">
          <div className="h-5 bg-slate-800 rounded w-1/4"></div>
          <div className="h-full bg-slate-850/50 rounded-xl w-full"></div>
        </div>
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 h-80 animate-pulse space-y-4">
          <div className="h-5 bg-slate-800 rounded w-1/3"></div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-850"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                  <div className="h-2 bg-slate-850 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
