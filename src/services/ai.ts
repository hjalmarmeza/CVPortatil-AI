import axios from 'axios';
import type { BaseCV } from '../data/baseCV';

const DEEPINFRA_API_URL = 'https://api.deepinfra.com/v1/openai/chat/completions';
const MODEL = 'meta-llama/Meta-Llama-3-70B-Instruct';

// Función sanitizadora de gramática española para corregir cacofonías (ej. "y implementé" -> "e implementé")
const fixSpanishCacophony = (text: string): string => {
  if (typeof text !== 'string') return text;
  
  return text
    // Reemplaza "y" por "e" antes de palabras que inician con i- o hi- (salvo si le sigue diptongo como "hie-")
    .replace(/\b([Yy])\s+([iI]|hi|hI|Hi|HI)([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/g, (match, yChar, prefix, rest) => {
      const fullWord = prefix + rest;
      if (/^hie/i.test(fullWord)) {
        return match;
      }
      const eChar = yChar === 'Y' ? 'E' : 'e';
      return `${eChar} ${fullWord}`;
    })
    // Reemplaza "o" por "u" antes de palabras que inician con o- u ho-
    .replace(/\b([Oo])\s+([oO]|ho|hO|Ho|HO)([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/g, (_match, oChar, prefix, rest) => {
      const fullWord = prefix + rest;
      const uChar = oChar === 'O' ? 'U' : 'u';
      return `${uChar} ${fullWord}`;
    });
};

const sanitizeObjectGrammar = (obj: any): any => {
  if (typeof obj === 'string') {
    return fixSpanishCacophony(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectGrammar);
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeObjectGrammar(obj[key]);
    }
    return sanitized;
  }
  return obj;
};

export const generateTailoredCV = async (
  jobDescription: string,
  baseCV: BaseCV,
  companyName: string = '',
  seniorityLevel: 'auto' | 'operational' | 'middle' | 'executive' = 'auto'
) => {
  const apiKey = import.meta.env.VITE_DEEPINFRA_API_KEY;

  if (!apiKey) {
    throw new Error('API Key no configurada. Por favor, revisa .env.local');
  }

  const prompt = `
Eres un experto redactor de CVs y cartas de presentación ejecutivas.
A continuación te proporciono el CV base de un candidato, la descripción de una oferta laboral y la información de la empresa objetivo.

CV BASE:
${JSON.stringify(baseCV, null, 2)}

OFERTA LABORAL:
${jobDescription}

EMPRESA A LA QUE SE POSTULA:
${companyName.trim() ? companyName : 'Extraer e inferir el nombre, valores y cultura de la empresa directamente del texto de la Oferta LaborAL.'}

CALIBRACIÓN DE SENIORIDAD Y NIVEL REQUERIDO:
${seniorityLevel === 'operational' 
  ? 'OBLIGATORIO: NIVEL OPERATIVO / TIENDA (Dependiente/a, Cajero/a, Reponedor/a, Auxiliar). Re-enfocar el CV y la carta para evitar sobrecualificación.' 
  : seniorityLevel === 'middle' 
  ? 'NIVEL MANDO MEDIO / ENCARGADO DE TIENDA (Liderazgo de equipo, gestión operativa, KPIs, turno).' 
  : seniorityLevel === 'executive' 
  ? 'NIVEL EJECUTIVO / DIRECTIVO (Estrategia, Transformación Digital, Dirección Regional, Presupuestos).' 
  : 'AUTO-DETECTAR NIVEL SEGÚN LA OFERTA LABORAL: Analizar si el puesto es operativo/tienda, mando medio o ejecutivo, y calibrar la experiencia en consecuencia.'}

TAREA:
1. INVESTIGACIÓN DE EMPRESA Y CULTURA:
   - Analiza e integra la visión, valores, tono de marca y cultura de la empresa solicitante.
   - En la CARTA DE PRESENTACIÓN, conecta de forma auténtica en el 1er y 3er párrafo con la misión de la empresa y por qué tu perfil encaja con su cultura.
   - En el CV, utiliza palabras clave propias del sector y de la cultura de dicha empresa.

2. ADAPTACIÓN Y CALIBRACIÓN DE SENIORIDAD DEL CV (REGLA CRÍTICA ANTI-SOBRECUALIFICACIÓN):
   - DEBES INCLUIR TODAS LAS EXPERIENCIAS LABORALES EXACTAS del CV Base. ESTÁ ESTRICTAMENTE PROHIBIDO ELIMINAR O DUPLICAR CARGOS.
   - PROHIBIDO INVENTAR O CAMBIAR LOS NOMBRES DE LAS EMPRESAS (company) Y NOMBRES DE PUESTOS (title) DEL CV BASE. Cada elemento en 'experience' DEBE CONSERVAR EXACTAMENTE el mismo 'company', 'period' y 'location' original del CV Base (PROHIBIDO inventar nombres de empresas ficticias como Kiko Food u otras).
   - REGLA DE CALIBRACIÓN DE SENIORIDAD:
     * SI EL PUESTO ES DE NIVEL OPERATIVO / TIENDA (ej: Dependiente/a, Reponedor/a, Cajero/a, Auxiliar, Atención al Cliente):
       • RESUMEN EJECUTIVO: DEBE SER OPERATIVO Y CERCANO AL ROL. Presenta al candidato como un profesional apasionado por el servicio al cliente de excelencia, asesoramiento personalizado, manejo ágil de TPV/caja, reposición cuidadosa y trabajo en equipo. PROHIBIDO sonar como un directivo costoso de nivel regional o corporativo que asuste al reclutador.
       • EXPERIENCIA LABORAL: Reescribe las funciones y logros enfocándolos hacia la ejecución táctica diaria: atención directa, resolución de dudas en tienda, arqueo de caja, reposición de producto, escaparatismo y colaboración. Suaviza o contextualiza las métricas ejecutivas gigantes para no parecer inaccesible. Conserva la empresa real del CV base.
       • DOMINIOS Y COMPETENCIAS (domainAreas): Adapta las competencias a: "Atención al Cliente & Venta", "Operaciones de Tienda & TPV", "Reposición & Control de Stock", "Escaparatismo & Visual Merchandising", "Trabajo en Equipo", "Comunicación & Proactividad".
       • HABILIDADES DESTACADAS (skills): Selecciona EXACTAMENTE entre 6 y 8 habilidades operativas clave (ej: Atención al Cliente, Manejo de TPV / Caja, Venta Personalizada, Reposición de Productos, Escaparatismo, Trabajo en Equipo, Proactividad, Resolución de Problemas).
       • PROYECTOS PERSONALES: Redáctalos como iniciativas prácticas de gestión comercial, atención al cliente u organización de tienda, evitando mencionar lenguajes de programación complejos (React, Node, MongoDB) que estén fuera del alcance de un puesto de dependiente.
     * SI EL PUESTO ES MANDO MEDIO / ENCARGADO:
       • Equilibra la atención al cliente y ejecución operativa con liderazgo de tienda, control de KPIs y gestión de equipo.
     * SI EL PUESTO ES EJECUTIVO / DIRECTIVO:
       • Mantén el tono de alto nivel, visión estratégica, transformación digital, IA e impacto financiero.

3. REGLAS GENERALES Y CANTIDADES ESTRICTAS:
   - CONOCIMIENTOS ADICIONALES (Portafolio): Genera EXACTAMENTE entre 3 y 4 proyectos personales adaptados al puesto. Usa el título "Proyectos Personales" o "Proyectos de Innovación Tecnológica".
   - CERTIFICACIONES: Selecciona OBLIGATORIAMENTE entre 6 y 8 certificaciones relevantes.
   - NO INVENTES NADA NUEVO. Re-enfoca la experiencia real del candidato.

4. REGLAS GRAMATICALES Y DE ESTILO (¡CUMPLIMIENTO ESTRICTO!):
   - REGLA GRAMATICAL SAGRADA (E/Y y U/O): Está ESTRICTAMENTE PROHIBIDO escribir "y" antes de palabras que inicien con sonido "i" o "hi" (Ejemplo PROHIBIDO: "Desarrollé y implementé", DEBE SER "Desarrollé e implementé"; PROHIBIDO: "Creatividad y innovación", DEBE SER "Creatividad e innovación"). De igual forma, reemplaza "o" por "u" antes de sonido "o" u "ho".
   - Usa un lenguaje HUMANO, PERSUASIVO Y ADECUADO AL NIVEL DEL PUESTO.

5. CARTA DE PRESENTACIÓN (¡SIGUE ESTAS REGLAS AL PIE DE LA LETRA!):
   - LONGITUD OBLIGATORIA: Entre 320 y 380 palabras en total en el cuerpo en 4 párrafos bien desarrollados separados por \\n\\n.
   - ESTRUCTURA OBLIGATORIA:
     1. Párrafo de apertura (4-5 oraciones): Muestra pasión por el sector de la empresa objetivo y la atención al cliente/tienda, conectando de inmediato tu perfil con la empresa solicitante. PROHIBIDO saludos genéricos.
     2. Párrafo de trayectoria y experiencia en el rol (5-6 oraciones): Describe tu bagaje liderando o ejecutando tareas clave con excelencia, trabajo en equipo y atención personalizada.
     3. Párrafo de conexión con la empresa y puesto (5-6 oraciones): Conecta directamente con las responsabilidades clave del puesto (caja/TPV, reposición, escaparatismo, servicio) y la visión de la empresa.
     4. Párrafo de cierre (3-4 oraciones): Conclusión confiada y entusiasta para coordinar una entrevista personal.
   - TONO: Inspirador, humano, cercano y profesional.
   - PROHIBICIONES ABSOLUTAS:
     • PROHIBIDO incluir firma ni despidos tipo "Atentamente" o tu nombre al final de la carta (el sistema HTML renderiza dinámicamente el bloque de firma).
     • PROHIBIDO REPETIR PÁRRAFOS.

Devuelve la respuesta ÚNICAMENTE en el siguiente formato JSON, sin texto adicional (es muy importante que el JSON sea válido y no tenga markdown \`\`\`json):
{
  "tailoredCV": {
    "summary": "...",
    "experience": [
      {
        "title": "...",
        "company": "...",
        "period": "...",
        "location": "...",
        "description": ["..."]
      }
    ],
    "skills": ["...", "..."],
    "domainAreas": [
      {
        "title": "...",
        "skills": ["...", "..."]
      }
    ],
    "certifications": ["...", "..."],
    "portfolioTitle": "Nombre adaptado de la sección del portafolio",
    "portfolio": [
      {
        "title": "...",
        "description": "Descripción reescrita y adaptada a la oferta..."
      }
    ]
  },
  "coverLetter": "Texto completo de la carta de presentación..."
}
`;

  try {
    const response = await axios.post(
      DEEPINFRA_API_URL,
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const parsedData = JSON.parse(content);
    
    // ESCUDO DE SEGURIDAD 1: Restaurar estrictamente la historia laboral real del CV Base
    if (parsedData?.tailoredCV?.experience && Array.isArray(parsedData.tailoredCV.experience)) {
      parsedData.tailoredCV.experience = parsedData.tailoredCV.experience.map((exp: any, i: number) => {
        const baseExp = baseCV.experience[i];
        if (baseExp) {
          return {
            ...exp,
            company: baseExp.company,
            period: baseExp.period,
            location: baseExp.location,
            title: exp.title && !exp.title.toLowerCase().includes('kiko') ? exp.title : baseExp.title
          };
        }
        return exp;
      });
    }

    // ESCUDO DE SEGURIDAD 2: Eliminar firmas o despidos al final de la carta para evitar firmas dobles encimadas
    if (parsedData?.coverLetter && typeof parsedData.coverLetter === 'string') {
      parsedData.coverLetter = parsedData.coverLetter
        .replace(/\n\n?(Atentamente|Un cordial saludo|Cordialmente|Sinceramente)[\s\S]*$/i, '')
        .trim();
    }

    // Sanitización automática de gramática y cacofonías (ej. "y implementé" -> "e implementé")
    return sanitizeObjectGrammar(parsedData);
  } catch (error) {
    console.error('Error llamando a DeepInfra:', error);
    throw new Error('Hubo un error al generar el CV. Por favor, intenta nuevamente.');
  }
};
