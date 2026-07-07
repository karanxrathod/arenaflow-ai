import React, { createContext, useContext, useState, ReactNode } from 'react';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' }
];

interface LanguageContextType {
  language: string;
  setLanguage: (code: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<string, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    commandCenter: 'Command Center',
    fanAssistant: 'Fan Assistant',
    vendorOperations: 'Vendor Operations',
    safetyAgent: 'Safety Agent',
    analytics: 'Analytics',
    settings: 'Settings',
    profile: 'Profile',
    capacity: 'Capacity',
    density: 'Density',
    alerts: 'Alerts',
    responseTime: 'Response Time',
    totalAttendance: 'Total Attendance',
    averageDensity: 'Average Density',
    activeAlerts: 'Active Alerts',
    aiResponseTime: 'AI Response Time',
    stadiumTwin: 'Stadium Twin',
    liveMatchday: 'Live Matchday',
    searchZones: 'Search zones, concessions...',
    saveSettings: 'Save Settings',
    resetSimulation: 'Reset World Cup Simulation',
    criticalSurge: 'Inject Crowd Surge Simulation',
    weather: 'Live Weather',
    transit: 'Transit Telemetry',
    stadiumOperationsTwin: 'Stadium Operations Twin',
    fanConciergeSupplySync: 'Fan Concierge & Supply Sync',
    safetyAgentDispatch: 'Safety & Agent Dispatch',
    arenaFlowCore: 'ArenaFlow AI Core Operations',
    designedForWorldCup: 'Designed for World Cup Venue Operations',
    synced: 'SYNCED',
    opsCommander: 'Operations Commander'
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    commandCenter: 'कमांड सेंटर',
    fanAssistant: 'फैन सहायक',
    vendorOperations: 'विक्रेता संचालन',
    safetyAgent: 'सुरक्षा एजेंट',
    analytics: 'विश्लेषण',
    settings: 'सेटिंग्स',
    profile: 'प्रोफ़ाइल',
    capacity: 'क्षमता',
    density: 'घनत्व',
    alerts: 'अलर्ट',
    responseTime: 'प्रतिक्रिया समय',
    totalAttendance: 'कुल उपस्थिति',
    averageDensity: 'औसत घनत्व',
    activeAlerts: 'सक्रिय अलर्ट',
    aiResponseTime: 'एआई प्रतिक्रिया समय',
    stadiumTwin: 'स्टेडियम ट्विन',
    liveMatchday: 'लाइव मैचडे',
    searchZones: 'जोन, रियायतें खोजें...',
    saveSettings: 'सेटिंग्स सहेजें',
    resetSimulation: 'विश्व कप सिमुलेशन रीसेट करें',
    criticalSurge: 'भीड़ वृद्धि सिमुलेशन दर्ज करें',
    weather: 'लाइव मौसम',
    transit: 'पारगमन टेलीमेट्री',
    stadiumOperationsTwin: 'स्टेडियम संचालन ट्विन',
    fanConciergeSupplySync: 'फैन कंसीयज और आपूर्ति सिंक',
    safetyAgentDispatch: 'सुरक्षा और एजेंट प्रेषण',
    arenaFlowCore: 'एरीनाफ्लो एआई कोर ऑपरेशंस',
    designedForWorldCup: 'विश्व कप स्थल संचालन के लिए डिज़ाइन किया गया',
    synced: 'सिंक्रनाइज़',
    opsCommander: 'संचालन कमांडर'
  },
  es: {
    dashboard: 'Panel de Control',
    commandCenter: 'Centro de Mando',
    fanAssistant: 'Asistente de Fan',
    vendorOperations: 'Operaciones de Vendedor',
    safetyAgent: 'Agente de Seguridad',
    analytics: 'Análisis',
    settings: 'Configuración',
    profile: 'Perfil',
    capacity: 'Capacidad',
    density: 'Densidad',
    alerts: 'Alertas',
    responseTime: 'Tiempo de Respuesta',
    totalAttendance: 'Asistencia Total',
    averageDensity: 'Densidad Promedio',
    activeAlerts: 'Alertas Activas',
    aiResponseTime: 'Tiempo de Respuesta AI',
    stadiumTwin: 'Gemelo Digital',
    liveMatchday: 'Partido en Vivo',
    searchZones: 'Buscar zonas, concesiones...',
    saveSettings: 'Guardar Configuración',
    resetSimulation: 'Reiniciar Simulación del Mundial',
    criticalSurge: 'Simular Fluido de Multitud',
    weather: 'Clima en Vivo',
    transit: 'Telemetría de Tránsito',
    stadiumOperationsTwin: 'Gemelo Operacional del Estadio',
    fanConciergeSupplySync: 'Asistente de Fan y Suministros',
    safetyAgentDispatch: 'Seguridad y Despacho de Agentes',
    arenaFlowCore: 'Operaciones del Núcleo ArenaFlow AI',
    designedForWorldCup: 'Diseñado para Operaciones de Sedes del Mundial',
    synced: 'SINCALIZADO',
    opsCommander: 'Comandante de Operaciones'
  },
  fr: {
    dashboard: 'Tableau de Bord',
    commandCenter: 'Centre de Commandement',
    fanAssistant: 'Assistant Fan',
    vendorOperations: 'Opérations Fournisseur',
    safetyAgent: 'Agent de Sécurité',
    analytics: 'Analytique',
    settings: 'Paramètres',
    profile: 'Profil',
    capacity: 'Capacité',
    density: 'Densité',
    alerts: 'Alertes',
    responseTime: 'Temps de Réponse',
    totalAttendance: 'Audience Totale',
    averageDensity: 'Densité Moyenne',
    activeAlerts: 'Alertes Actives',
    aiResponseTime: 'Temps de Réponse IA',
    stadiumTwin: 'Jumeau de Stade',
    liveMatchday: 'Jour de Match en Direct',
    searchZones: 'Rechercher zones, concessions...',
    saveSettings: 'Enregistrer les Paramètres',
    resetSimulation: 'Réinitialiser la Simulation de Coupe du Monde',
    criticalSurge: 'Injecter une Simulation de Foule',
    weather: 'Météo en Direct',
    transit: 'Télémétrie de Transport',
    stadiumOperationsTwin: 'Jumeau d\'Opérations de Stade',
    fanConciergeSupplySync: 'Concierge Fan et Synchro Vendeurs',
    safetyAgentDispatch: 'Sécurité et Dispatch d\'Agents',
    arenaFlowCore: 'Opérations de Base d\'ArenaFlow AI',
    designedForWorldCup: 'Conçu pour les Opérations de Stade de la Coupe du Monde',
    synced: 'SYNCHRONISÉ',
    opsCommander: 'Commandant des Opérations'
  },
  ar: {
    dashboard: 'لوحة القيادة',
    commandCenter: 'مركز القيادة',
    fanAssistant: 'مساعد المشجع',
    vendorOperations: 'عمليات البائع',
    safetyAgent: 'وكيل السلامة',
    analytics: 'تحليلات',
    settings: 'إعدادات',
    profile: 'الملف الشخصي',
    capacity: 'السعة',
    density: 'الكثافة',
    alerts: 'تنبيهات',
    responseTime: 'وقت الاستجابة',
    totalAttendance: 'إجمالي الحضور',
    averageDensity: 'متوسط الكثافة',
    activeAlerts: 'التنبيهات النشطة',
    aiResponseTime: 'وقت استجابة الذكاء الاصطناعي',
    stadiumTwin: 'توأم الاستاد',
    liveMatchday: 'يوم المباراة المباشر',
    searchZones: 'البحث عن المناطق والمبيعات...',
    saveSettings: 'حفظ الإعدادات',
    resetSimulation: 'إعادة ضبط محاكاة كأس العالم',
    criticalSurge: 'محاكاة زيادة حشد المفاجئ',
    weather: 'الطقس المباشر',
    transit: 'تتبع حركة المرور',
    stadiumOperationsTwin: 'توأم عمليات الاستاد المباشر',
    fanConciergeSupplySync: 'مساعد المشجع وتزامن المبيعات',
    safetyAgentDispatch: 'السلامة وإرسال الوكلاء',
    arenaFlowCore: 'عمليات نظام ArenaFlow AI الرئيسية',
    designedForWorldCup: 'مصمم لعمليات ملاعب كأس العالم',
    synced: 'متزامن',
    opsCommander: 'قائد العمليات'
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState('en');

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
