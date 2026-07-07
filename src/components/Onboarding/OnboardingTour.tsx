import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector to highlight or point to (optional)
  position: 'top' | 'bottom' | 'left' | 'right';
  tab?: 'dashboard' | 'twin' | 'fan' | 'vendor' | 'safety' | 'analytics' | 'settings' | 'profile';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '👋 Welcome to ArenaFlow AI',
    description: "Your operations command center for the FIFA World Cup 2026. Let's take a quick 1-minute onboarding tour to master the system!",
    target: 'body',
    position: 'bottom'
  },
  {
    id: 'dashboard',
    title: '📊 Operations Dashboard',
    description: 'Monitor overall attendance, density levels across all gates, active multi-agent dispatches, and trigger real-time crowd surge simulations.',
    target: '.dashboard-metrics',
    position: 'bottom',
    tab: 'dashboard'
  },
  {
    id: 'command-twin',
    title: '🏟️ Command Twin Heatmap',
    description: 'A responsive digital twin of the stadium concourses. Inspect individual gates, toilets, and concessions, and manually throttle density.',
    target: '[data-module="command-twin"]',
    position: 'right',
    tab: 'twin'
  },
  {
    id: 'fan-assistant',
    title: '💬 Multilingual Fan Concierge',
    description: 'An AI-powered assistant translating wayfinding queries, waiting times, and local recommendations into 5 world languages in real-time.',
    target: '[data-module="fan-assistant"]',
    position: 'right',
    tab: 'fan'
  },
  {
    id: 'vendor-sync',
    title: '🌭 Intelligent Vendor Prep',
    description: 'Predicts high demand, recommends pre-preparation limits for Tacos & Beers, and triggers supply warnings to keep concession queues under 10 mins.',
    target: '[data-module="vendor-sync"]',
    position: 'left',
    tab: 'vendor'
  },
  {
    id: 'safety-agent',
    title: '🛡️ Multi-Agent Safety dispatch',
    description: 'See autonomous agents (Supervisor, Analysis, and Mitigation) coordinate digital banner rerouting, load dispersal, and incident closing.',
    target: '[data-module="safety-agent"]',
    position: 'right',
    tab: 'safety'
  },
  {
    id: 'profile',
    title: '👤 Professional Profile Settings',
    description: 'Manage your credentials, change user roles, toggle UI translations, or switch high contrast accessibility settings.',
    target: '.profile-section',
    position: 'left',
    tab: 'profile'
  },
  {
    id: 'complete',
    title: '🎉 System Active & Ready!',
    description: 'You are fully trained to operate MetLife Stadium NYNJ. Return to the main dashboard and keep the stadium safe!',
    target: 'body',
    position: 'bottom',
    tab: 'dashboard'
  }
];

interface OnboardingTourProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const OnboardingTour = ({ activeTab, setActiveTab }: OnboardingTourProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('arenaflow_tour_seen');
    if (!hasSeenTour) {
      setIsActive(true);
    }
  }, []);

  const handleNext = () => {
    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < tourSteps.length) {
      const nextStep = tourSteps[nextStepIndex];
      if (nextStep.tab) {
        setActiveTab(nextStep.tab);
      }
      setCurrentStep(nextStepIndex);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      const prevStep = tourSteps[prevStepIndex];
      if (prevStep.tab) {
        setActiveTab(prevStep.tab);
      }
      setCurrentStep(prevStepIndex);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('arenaflow_tour_seen', 'true');
    setIsActive(false);
  };

  const handleRestartTour = () => {
    setCurrentStep(0);
    setActiveTab('dashboard');
    setIsActive(true);
  };

  if (!isActive) {
    return (
      <button 
        onClick={handleRestartTour}
        className="fixed bottom-6 right-6 z-40 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold p-3 rounded-full shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center transition-all group hover:scale-105"
        title="Start System Tour"
      >
        <HelpCircle className="w-5 h-5" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out text-xs font-bold font-sans ml-0 group-hover:ml-2 whitespace-nowrap">
          Quick Tour
        </span>
      </button>
    );
  }

  const step = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Darkened backdrop overlay with blur */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-all duration-300"
        onClick={handleComplete}
      />

      {/* Dynamic Popover modal Card */}
      <div className="relative bg-slate-900 border border-amber-500/30 text-slate-100 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-amber-500/10 z-50 animate-fade-in">
        
        {/* Floating Accent Ring */}
        <div className="absolute -top-3 -left-3 w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-xl shadow-md">
          🏆
        </div>

        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close tour"
        >
          <X size={18} />
        </button>

        <div className="mt-4 mb-6">
          <h3 className="text-white font-display font-extrabold text-lg tracking-wide">{step.title}</h3>
          <p className="text-slate-300 text-sm mt-2.5 leading-relaxed font-sans">{step.description}</p>
        </div>

        {/* Action Controls and Staggered Progress Dots */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4">
          <div className="flex gap-1.5">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-amber-500 w-4 shadow shadow-amber-500/30' 
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-850 hover:text-white transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/10 transition-all text-xs flex items-center gap-1 cursor-pointer"
            >
              {currentStep === tourSteps.length - 1 ? 'Start Operating' : 'Next'}
              {currentStep < tourSteps.length - 1 && <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
