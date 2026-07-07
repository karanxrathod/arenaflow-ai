import { GoogleGenAI, Type } from '@google/genai';
import { StadiumState, RiskAssessment } from '../src/types.js';

let aiInstance: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.');
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Module 1: AI Risk Intelligence Engine
export async function getRiskAssessment(stadiumState: StadiumState): Promise<RiskAssessment> {
  try {
    const ai = getGemini();

    // Create a structured, highly descriptive prompt presenting the stadium state
    const prompt = `
You are the AI Risk Intelligence Engine for ArenaFlow AI, powering operations for the FIFA World Cup 2026.
Evaluate the stadium threat, congestion, and operational risk using the live stadium state provided below.

LIVE STADIUM STATE:
- Weather: Temp: ${stadiumState.weather.temp}, Condition: ${stadiumState.weather.condition}, Wind: ${stadiumState.weather.wind}
- Transit: Subway: ${stadiumState.transit.subwayStatus}, Shuttles: ${stadiumState.transit.shuttleStatus}, Parking: ${stadiumState.transit.parkingStatus}, Transit Load: ${stadiumState.transit.loadLevel}
- Zones Data:
${stadiumState.zones.map(z => `  * ${z.name}: Density ${z.density}%, Current Count: ${z.currentCount}/${z.capacity}, Queue Time: ${z.queueTimeMin}m, Status: ${z.status}`).join('\n')}
- Unresolved Incidents:
${stadiumState.incidents.filter(i => i.status !== 'RESOLVED').map(i => `  * [${i.severity}] in ${i.zoneName}: ${i.message}`).join('\n')}

Based on this data, assess:
1. Overall Risk Score (0 to 100): Weighted heavily on Critical/High zone density, transit load, and active incidents.
2. Risk Level: LOW (score 0-35), MEDIUM (score 36-55), HIGH (score 56-75), or CRITICAL (score 76-100).
3. Summary: Brief, professional, operational assessment.
4. Weather Impact: How current weather conditions affect fans (e.g. heat exhaustion, rain bottle-necks).
5. Transit Impact: How current transit/parking delays affect ingress/egress patterns.
6. Recommendations: Actionable tactical commands for stadium operations (e.g., dispatch staff, reroute shuttle buses, update signage).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an elite, highly analytical Chief of Safety and Stadium Operations Agent for FIFA World Cup matches.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { 
              type: Type.INTEGER, 
              description: "Risk score from 0 to 100 calculated mathematically based on densities, transit load, and incidents." 
            },
            level: { 
              type: Type.STRING, 
              description: "The corresponding risk tier: LOW, MEDIUM, HIGH, or CRITICAL." 
            },
            summary: { 
              type: Type.STRING, 
              description: "Concisely describe current congestion or safety concerns." 
            },
            weatherImpact: { 
              type: Type.STRING, 
              description: "Specific analysis of how weather impacts fan safety and line waiting." 
            },
            transitImpact: { 
              type: Type.STRING, 
              description: "Analysis of how rail/parking conditions impact ingress or egress surges." 
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A bulleted list of 3-5 specific, practical, actionable instructions for operators."
            }
          },
          required: ["score", "level", "summary", "weatherImpact", "transitImpact", "recommendations"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as RiskAssessment;
  } catch (error) {
    console.warn('Gemini API quota or key inactive. Initiating high-performance rule-based safety fallback engine:', error);
    
    // Calculate high-fidelity metrics based on real-time stadium state
    const zones = stadiumState.zones || [];
    const avgDensity = zones.length > 0 
      ? Math.round(zones.reduce((acc, curr) => acc + curr.density, 0) / zones.length) 
      : 45;
    const highestDensity = zones.length > 0 
      ? Math.max(...zones.map(z => z.density)) 
      : 55;
    const activeIncidents = stadiumState.incidents?.filter(i => i.status !== 'RESOLVED') || [];
    
    // Determine level
    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let baseScore = avgDensity;
    if (highestDensity >= 75 || activeIncidents.some(i => i.severity === 'CRITICAL')) {
      level = 'CRITICAL';
      baseScore = Math.max(baseScore, 82);
    } else if (highestDensity >= 55 || activeIncidents.some(i => i.severity === 'WARNING')) {
      level = 'HIGH';
      baseScore = Math.max(baseScore, 62);
    } else if (highestDensity >= 35) {
      level = 'MEDIUM';
      baseScore = Math.max(baseScore, 42);
    }
    
    const finalScore = Math.min(100, Math.max(0, baseScore + (activeIncidents.length * 10)));
    
    let summary = `Local rule-based safety engine assessed stadium telemetry. Gate configurations show stable crowd movement with active multi-agent diversion guidelines.`;
    if (level === 'CRITICAL') {
      summary = `CRITICAL ALERT: Dynamic high-density surge detected (peak ${highestDensity}%). Multi-agent spectator dispersion plans are highly recommended to prevent bottlenecks.`;
    } else if (level === 'HIGH') {
      summary = `WARNING: Heavy ingress density at selected entrance sectors (peak ${highestDensity}%). Multi-agent safety flow guides are currently actively re-routing fans.`;
    } else if (level === 'MEDIUM') {
      summary = `CONGESTION MONITOR: Moderate spectator movement. Normal queue accumulation at stadium concessions and restrooms.`;
    }

    const recommendations = [
      'Maintain continuous digital twin surveillance on all major gate sectors.',
      'Recommend fans use the multi-lingual mobile concierge to discover low-density restrooms/concessions.'
    ];

    if (highestDensity >= 55) {
      recommendations.unshift(`Direct staff guides to divert spectators from peak congestion areas to adjacent gate sectors.`);
      recommendations.push(`Update dynamic electronic banners and digital twin signage to display walking routes to Gate F & H.`);
    } else {
      recommendations.unshift(`Ensure auxiliary ticket-scanning stations remain fully staffed.`);
    }

    if (activeIncidents.length > 0) {
      recommendations.unshift(`Prioritize autonomous agent dispatch to resolve active incident: "${activeIncidents[0].message}".`);
    }

    return {
      score: finalScore,
      level: level,
      summary: summary,
      weatherImpact: `Temperature of ${stadiumState.weather.temp} with ${stadiumState.weather.condition}. Normal wind patterns do not pose risk to outdoor wait lines.`,
      transitImpact: `Transit Load Level at ${stadiumState.transit.loadLevel}. Rail status is ${stadiumState.transit.subwayStatus} and shuttle service is ${stadiumState.transit.shuttleStatus}.`,
      recommendations: recommendations
    };
  }
}

// Module 2: Fan Experience & Navigation Agent
export async function getFanResponse(query: string, _history: { role: 'user' | 'model'; text: string }[], stadiumState: StadiumState, selectedLang: string = 'English'): Promise<string> {
  try {
    const ai = getGemini();

    // Extract amenities to easily let Gemini match queries
    const allConcessions = stadiumState.zones.flatMap(z => 
      z.amenities.concessions.map(c => ({ ...c, zoneName: z.name, zoneDensity: z.density }))
    );
    const allToilets = stadiumState.zones.flatMap(z => 
      z.amenities.toilets.map(t => ({ ...t, zoneName: z.name, zoneDensity: z.density }))
    );
    const allMerch = stadiumState.zones.flatMap(z => 
      z.amenities.merch.map(m => ({ ...m, zoneName: z.name, zoneDensity: z.density }))
    );

    const prompt = `
You are the ArenaFlow AI Fan Experience and Navigation Agent for the 2026 FIFA World Cup.
Your task is to help fans navigate the stadium, find amenities (concessions, restrooms, merchandise), check queues, and receive smart, congestion-aware directions.

USER QUERY: "${query}"
PREFFERED RESPONSE LANGUAGE: ${selectedLang}

REAL-TIME STADIUM AMENITY DATA:
- Concessions/Food & Beer:
${allConcessions.map(c => `  * "${c.name}" in ${c.zoneName} (Distance: ${c.distanceM}m, Wait: ${c.waitTimeMin} mins, Serves: ${c.items.join(', ')}, Zone Density: ${c.zoneDensity}%)`).join('\n')}

- Restrooms/Bathrooms:
${allToilets.map(t => `  * "${t.name}" in ${t.zoneName} (Distance: ${t.distanceM}m, Wait: ${t.waitTimeMin} mins, Zone Density: ${t.zoneDensity}%)`).join('\n')}

- Merchandise/FIFA Fan Shops:
${allMerch.map(m => `  * "${m.name}" in ${m.zoneName} (Distance: ${m.distanceM}m, Wait: ${m.waitTimeMin} mins, Zone Density: ${m.zoneDensity}%)`).join('\n')}

- Gates/Entry Crowd Density:
${stadiumState.zones.map(z => `  * ${z.name}: ${z.density}% Density, ${z.queueTimeMin} mins wait time.`).join('\n')}

INSTRUCTIONS:
1. Always respond in the preferred language requested: ${selectedLang}. If the user asks in Spanish, Hindi, or French, respond beautifully in that language!
2. Keep your answer practical, accurate, and extremely helpful. Mention names of concessions, restrooms, and zones.
3. Factor in congestion! If a fan asks for food or beer near Gate G (which has critical 76% density and 32 mins wait), suggest they walk slightly to Gate F or Gate H where density is lower, wait times are shorter, and distance is within 50m!
4. Be warm and professional. Do not hallucinate any concession or restroom name not present in the list above. If nothing is found, politely state what is available.
5. Use markdown lists for readability. Keep the answer relatively brief and easily readable on a smartphone screen.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are the official multi-lingual mobile concierge agent inside the stadium app. Provide clear, direct, and cheerful service.",
        temperature: 0.7,
      }
    });

    return response.text || "I am having trouble accessing the real-time map. Please follow physical signage or ask venue staff for assistance.";
  } catch (error) {
    console.warn('Gemini API fan assistant operating on localized offline rules:', error);
    
    const queryLower = query.toLowerCase();
    const langLower = (selectedLang || 'English').toLowerCase();
    
    // Calculate nearest or lowest wait items
    const sortedZones = [...stadiumState.zones].sort((a, b) => a.queueTimeMin - b.queueTimeMin);
    const bestGate = sortedZones[0]?.name || 'Gate B';
    const bestWait = sortedZones[0]?.queueTimeMin || 2;
    
    const bestConcessions = stadiumState.zones
      .flatMap(z => z.amenities.concessions.map(c => ({ ...c, zoneName: z.name, density: z.density })))
      .sort((a, b) => a.waitTimeMin - b.waitTimeMin);
    const bestConcessionName = bestConcessions[0]?.name || 'World Cup Grill';
    const bestConcessionZone = bestConcessions[0]?.zoneName || 'Gate B';
    const bestConcessionWait = bestConcessions[0]?.waitTimeMin || 5;

    const bestToilets = stadiumState.zones
      .flatMap(z => z.amenities.toilets.map(t => ({ ...t, zoneName: z.name, density: z.density })))
      .sort((a, b) => a.waitTimeMin - b.waitTimeMin);
    const bestToiletName = bestToilets[0]?.name || 'NE Restroom 105';
    const bestToiletZone = bestToilets[0]?.zoneName || 'Gate B';
    const bestToiletWait = bestToilets[0]?.waitTimeMin || 2;

    if (langLower.includes('span') || langLower.includes('es')) {
      if (queryLower.includes('baño') || queryLower.includes('toilet') || queryLower.includes('restroom') || queryLower.includes('wc')) {
        return `**Asistente de Navegación (Modo Desconectado Seguro):**\n\nEl baño más cercano con menor tiempo de espera es **${bestToiletName}** en **${bestToiletZone}** (espera estimada de **${bestToiletWait} minutos**).\n\n*Consejo de Flujo:* Evite los baños de zonas con alta densidad para reducir tiempos de espera.`;
      }
      if (queryLower.includes('comida') || queryLower.includes('taco') || queryLower.includes('cerveza') || queryLower.includes('hambre') || queryLower.includes('comer') || queryLower.includes('concesión')) {
        return `**Asistente de Concesiones (Modo Desconectado Seguro):**\n\nLe recomendamos **${bestConcessionName}** en **${bestConcessionZone}** con solo **${bestConcessionWait} minutos** de fila.\n\n*Recomendación de seguridad:* Para evitar aglomeraciones, le sugerimos caminar a zonas con densidad menor al 50%.`;
      }
      return `**Asistente de ArenaFlow (Modo Desconectado Seguro):**\n\n¡Hola! Las puertas **${bestGate}** están actualmente despejadas con solo **${bestWait} minutos** de espera.\n\n¿En qué otra cosa puedo guiarle dentro del estadio?`;
    }

    if (langLower.includes('fren') || langLower.includes('fr')) {
      if (queryLower.includes('toilet') || queryLower.includes('wc') || queryLower.includes('restroom') || queryLower.includes('toilette')) {
        return `**Le Concierge de Navigation (Mode Hors-ligne Sécurisé) :**\n\nLes toilettes les plus fluides sont **${bestToiletName}** situées à **${bestToiletZone}** (temps d'attente estimé : **${bestToiletWait} min**).\n\n*Conseil de foule :* Évitez les secteurs à forte densité pour minimiser l'attente.`;
      }
      if (queryLower.includes('manger') || queryLower.includes('faim') || queryLower.includes('taco') || queryLower.includes('biere') || queryLower.includes('nourriture')) {
        return `**L'Assistant Concessions (Mode Hors-ligne Sécurisé) :**\n\nNous vous conseillons **${bestConcessionName}** au **${bestConcessionZone}** (seulement **${bestConcessionWait} min** d'attente).\n\n*Optimisation :* Privilégiez les points de restauration hors des zones rouges pour plus de rapidité.`;
      }
      return `**L'Assistant ArenaFlow (Mode Hors-ligne Sécurisé) :**\n\nBonjour ! Les entrées à **${bestGate}** sont très fluides avec environ **${bestWait} minutes** d'attente.\n\nComment puis-je vous aider aujourd'hui ?`;
    }

    if (langLower.includes('hind') || langLower.includes('hi')) {
      if (queryLower.includes('toilet') || queryLower.includes('restroom') || queryLower.includes('शौचालय') || queryLower.includes('वॉशरुम')) {
        return `**नेविगेशन सहायक (सुरक्षित स्थानीय मोड):**\n\nसबसे कम प्रतीक्षा समय वाला शौचालय **${bestToiletZone}** में **${bestToiletName}** है (प्रतीक्षा समय: **${bestToiletWait} मिनट**)।\n\n*भीड़ से बचने की सलाह:* प्रतीक्षा समय कम करने के लिए उच्च घनत्व वाले क्षेत्रों के शौचालयों से बचें।`;
      }
      if (queryLower.includes('food') || queryLower.includes('भूख') || queryLower.includes('खाना') || queryLower.includes('taco') || queryLower.includes('pizza') || queryLower.includes('भोजन')) {
        return `**खान-पान सहायक (सुरक्षित स्थानीय मोड):**\n\nहम आपको **${bestConcessionZone}** में **${bestConcessionName}** की सलाह देते हैं जहाँ केवल **${bestConcessionWait} मिनट** की कतार है।\n\n*सुरक्षा सुझाव:* भीड़भाड़ से बचने के लिए 50% से कम घनत्व वाले क्षेत्रों में जाएँ।`;
      }
      return `**एरिनाफ्لو सहायक (सुरक्षित स्थानीय मोड):**\n\nनमस्कार! गेट **${bestGate}** वर्तमान में केवल **${bestWait} मिनट** के प्रतीक्षा समय के साथ सुगम है।\n\nमैं आज स्टेडियम में आपकी क्या सहायता कर सकता हूँ?`;
    }

    if (langLower.includes('arab') || langLower.includes('ar')) {
      if (queryLower.includes('toilet') || queryLower.includes('restroom') || queryLower.includes('حمام') || queryLower.includes('دورة') || queryLower.includes('مرحاض')) {
        return `**مساعد التوجيه (وضع الاتصال المحلي الآمن):**\n\nأفضل دورة مياه هي **${bestToiletName}** في **${bestToiletZone}** بانتظار يقدر بـ **${bestToiletWait} دقائق** فقط.\n\n*نصيحة الازدحام:* تجنب الحمامات في المناطق ذات الكثافة العالية لتوفير الوقت.`;
      }
      if (queryLower.includes('food') || queryLower.includes('طعام') || queryLower.includes('اكل') || queryLower.includes('جائع') || queryLower.includes('تاكو') || queryLower.includes('شراب')) {
        return `**مساعد المطاعم (وضع الاتصال المحلي الآمن):**\n\nننصحك بـ **${bestConcessionName}** في **${bestConcessionZone}** بوقت انتظار يبلغ **${bestConcessionWait} دقائق** فقط.\n\n*توجيه أمني:* يفضل التوجه للمطاعم في البوابات الأقل ازدحاماً.`;
      }
      return `**مساعد ملاعب كأس العالم (وضع الاتصال المحلي الآمن):**\n\nمرحباً بك! البوابات في **${bestGate}** ميسرة للغاية ووقت الانتظار فيها يقدر بـ **${bestWait} دقائق** فقط.\n\nكيف يمكنني مساعدتك في التنقل وتجنب الازدحام اليوم؟`;
    }

    // Default English
    if (queryLower.includes('toilet') || queryLower.includes('restroom') || queryLower.includes('washroom') || queryLower.includes('wc')) {
      return `**Navigation Guide (Secure Local Mode):**\n\nThe nearest restroom with the shortest line is **${bestToiletName}** at **${bestToiletZone}** (estimated wait is **${bestToiletWait} minutes**).\n\n*Crowd Flow Tip:* Avoid restrooms in high density zones to save time.`;
    }
    if (queryLower.includes('food') || queryLower.includes('eat') || queryLower.includes('beer') || queryLower.includes('taco') || queryLower.includes('pizza') || queryLower.includes('hungry')) {
      return `**Concessions Guide (Secure Local Mode):**\n\nWe recommend **${bestConcessionName}** at **${bestConcessionZone}** which has only a **${bestConcessionWait}-minute** queue.\n\n*Safety Recommendation:* Walk to lower density zones (under 50%) for faster food service.`;
    }
    return `**ArenaFlow Concierge (Secure Local Mode):**\n\nHello! Gates around **${bestGate}** are currently highly fluid with only **${bestWait} minutes** wait time.\n\nHow else can I assist your navigation inside the stadium today?`;
  }
}
