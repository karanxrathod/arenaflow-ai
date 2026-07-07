import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext.jsx';
import { ChevronDown, Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
      >
        <Globe className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold">{current.flag} {current.name}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-fade-in text-xs">
          <div className="px-3 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-850 mb-1">
            Select Language
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full text-left px-4 py-2 hover:bg-slate-850 transition-colors flex items-center gap-2.5 cursor-pointer ${
                language === lang.code ? 'text-amber-400 font-bold bg-slate-950/40' : 'text-slate-300'
              }`}
            >
              <span className="text-sm">{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && (
                <span className="ml-auto text-amber-400 font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
