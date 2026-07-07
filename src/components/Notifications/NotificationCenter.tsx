import { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle, ShieldAlert } from 'lucide-react';
import { Incident } from '../../types.js';
import { useLanguage } from '../../context/LanguageContext.js';

interface NotificationCenterProps {
  incidents: Incident[];
  onNavigateToSafety: () => void;
}

export const NotificationCenter = ({ incidents, onNavigateToSafety }: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const { t } = useLanguage();

  // Load read notifications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('arenaflow_read_notifications');
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse read notification IDs:', e);
    }
  }, []);

  // Calculate unread count
  const unreadCount = incidents.filter(inc => !readIds.includes(inc.id)).length;

  const handleMarkRead = (id: string) => {
    if (readIds.includes(id)) return;
    const newRead = [...readIds, id];
    setReadIds(newRead);
    localStorage.setItem('arenaflow_read_notifications', JSON.stringify(newRead));
  };

  const handleMarkAllRead = () => {
    const allIds = incidents.map(inc => inc.id);
    setReadIds(allIds);
    localStorage.setItem('arenaflow_read_notifications', JSON.stringify(allIds));
  };

  const handleNotificationClick = (inc: Incident) => {
    handleMarkRead(inc.id);
    setIsOpen(false);
    onNavigateToSafety();
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          icon: <ShieldAlert className="text-rose-500 w-4 h-4" />,
          badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
          container: 'border-l-2 border-l-rose-500'
        };
      case 'WARNING':
        return {
          icon: <AlertTriangle className="text-amber-500 w-4 h-4" />,
          badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
          container: 'border-l-2 border-l-amber-500'
        };
      default:
        return {
          icon: <Info className="text-sky-500 w-4 h-4" />,
          badge: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
          container: 'border-l-2 border-l-sky-500'
        };
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-slate-400 hover:text-white p-2 bg-slate-950 border border-slate-850 rounded-xl transition-all cursor-pointer hover:border-amber-500/30"
        aria-label="Open notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[9px] font-mono text-white flex items-center justify-center rounded-full font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop layer to click away */}
          <div 
            className="fixed inset-0 z-40 cursor-default" 
            onClick={() => setIsOpen(false)} 
          />

          <div className="absolute right-0 mt-2 w-85 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3 animate-fade-in text-sans">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide uppercase font-display">
                  {t('notifications') || 'Live System Notifications'}
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Close notifications"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {incidents.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500/30 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">All systems green</p>
                  <p className="text-[10px] text-slate-500">No active stadium threats reported.</p>
                </div>
              ) : (
                incidents.map((inc) => {
                  const isUnread = !readIds.includes(inc.id);
                  const styles = getSeverityStyles(inc.severity);
                  return (
                    <div
                      key={inc.id}
                      onClick={() => handleNotificationClick(inc)}
                      className={`p-3 bg-slate-950/50 rounded-xl text-xs flex gap-3 hover:bg-slate-850/40 transition-all cursor-pointer border border-slate-850/40 group relative ${styles.container} ${
                        isUnread ? 'bg-amber-500/[0.02] border-amber-500/10' : ''
                      }`}
                    >
                      {styles.icon}
                      <div className="flex-1 space-y-1 pr-4">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-extrabold text-slate-100 group-hover:text-amber-400 transition-colors">
                            {inc.zoneName}
                          </p>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold font-mono tracking-wider ${styles.badge}`}>
                            {inc.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-2">
                          {inc.message}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-900/30">
                          <span>{inc.timestamp}</span>
                          <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded uppercase">
                            {inc.status}
                          </span>
                        </div>
                      </div>
                      {isUnread && (
                        <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
