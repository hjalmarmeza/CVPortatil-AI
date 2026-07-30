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

EMPRESA A LA QUE SE POSTULA / AGENCIA DE SELECCIÓN:
${companyName.trim() ? companyName : 'Si no se especifica, redacta la carta de forma elegante e imparcial enfocado en la posición solicitada sin nombrar marcas ficticias.'}

CALIBRACIÓN DE ENTIDAD RECLUTADORA VS EMPRESA FINAL:
- Si se menciona una agencia de selección / ETT / Headhunter (ej: Grafton, Randstad, Adecco, Manpower, etc.) o no se conoce la empresa final:
  • Queda ESTRICTAMENTE PROHIBIDO redactar la carta como si el candidato quisiera trabajar "dentro de la agencias de selección".
  • La carta debe presentar la candidatura a la posición solicitada de forma neutra y profesional: "Presento mi candidatura para la posición de [Nombre del Puesto]..."
  • PROHIBIDO decir "Me atrae la cultura de Grafton" o "Quiero unirme a Grafton".

CALIBRACIÓN DE SENIORIDAD Y NIVEL REQUERIDO:
${seniorityLevel === 'operational' 
  ? 'OBLIGATORIO: NIVEL OPERATIVO / TIENDA (Dependiente/a, Cajero/a, Reponedor/a, Auxiliar). Re-enfocar el CV y la carta para evitar sobrecualificación.' 
  : seniorityLevel === 'middle' 
  ? 'NIVEL MANDO MEDIO / ENCARGADO DE TIENDA (Liderazgo de equipo, gestión operativa, KPIs, turno).' 
  : seniorityLevel === 'executive' 
  ? 'NIVEL EJECUTIVO / DIRECTIVO (Estrategia, Transformación Digital, Dirección Regional, Presupuestos).' 
  : 'AUTO-DETECTAR NIVEL SEGÚN LA OFERTA LABORAL: Analizar si el puesto es operativo/tienda, mando medio o ejecutivo, y calibrar la experiencia en consecuencia.'}

TAREA:
1. ADAPTACIÓN REALISTA Y SIN CLICHÉS (¡CERO ADULACIÓN O HABILIDADES INVENTADAS!):\n   - PROHIBIDO MENCIONAR ÁREAS QUE NO ESTÉN EN EL CV BASE: NUNCA menciones 'marketing', 'finanzas corporativas' o áreas en las que el candidato no ha trabajado. Mantén la historia estrictamente en Operaciones, Atención al Cliente, Gestión de Tiendas/Call Center, Liderazgo de Equipos y Transformación Digital/IA.
   - PROHIBIDO FRASES ADULADORAS O CURSIS: Queda ESTRICTAMENTE PROHIBIDO usar frases como "Me siento atraído por la cultura de...", "Me identifico plenamente con los valores de...", "Quedo a su disposición para discutir cómo mi visión...", "empresa solicitante".
   - LA REDACCIÓN DEBE SER HUMANA, REALISTA, AUTÉNTICA Y SOBRIA.

2. ADAPTACIÓN Y CALIBRACIÓN DE SENIORIDAD DEL CV (REGLA CRÍTICA ANTI-SOBRECUALIFICACIÓN):
   - DEBES INCLUIR TODAS LAS EXPERIENCIAS LABORALES EXACTAS del CV Base. ESTÁ ESTRICTAMENTE PROHIBIDO ELIMINAR O DUPLICAR CARGOS.
   - PROHIBIDO INVENTAR O CAMBIAR LOS NOMBRES DE LAS EMPRESAS (company) Y NOMBRES DE PUESTOS (title) DEL CV BASE. Cada elemento en 'experience' DEBE CONSERVAR EXACTAMENTE el mismo 'title', 'company', 'period' y 'location' original del CV Base. PROHIBIDO inventar puestos como "Director/a de Tienda" si el puesto base es "Gestor de Negocio Familiar & Consultor IA". PROHIBIDO inventar tareas absurdas (como mermeladas, bases de datos relacionales en tienda o alianzas internacionales sin sentido).
   - REGLA DE CALIBRACIÓN DE SENIORIDAD:
     * SI EL PUESTO ES DE NIVEL OPERATIVO / TIENDA (ej: Dependiente/a, Reponedor/a, Cajero/a, Auxiliar, Atención al Cliente):
       • RESUMEN EJECUTIVO (OBLIGATORIAMENTE 3-4 frases completas adaptadas al puesto operativo): Presenta al candidato como profesional apasionado por la atención al cliente, el servicio de excelencia, la gestión del punto de venta, el trabajo en equipo y la resolución de incidencias. Extrae la información del CV base (18 años de trayectoria, liderazgo de equipos, experiencia en operaciones de tienda). NO inventes nada, REUTILIZA y ADAPTA lo que ya está en el CV base al tono operativo del puesto.
       • EXPERIENCIA LABORAL: DEBE REDACTARSE EN PRIMERA PERSONA DEL SINGULAR ACTIVA (ej: "Lideré...", "Desarrollé...", "Implementé...", "Supervisé...", "Optimicé..."). OBLIGATORIO MÍNIMO 4 VIÑETAS POR CARGO. Reescribe las funciones y logros del CV base reenfocándolos hacia la ejecución operativa del puesto (atención directa al cliente, gestión del punto de venta, trabajo en equipo, cumplimiento de objetivos). Conserva el cargo real y empresa real del CV base.
       • DOMINIOS Y COMPETENCIAS (domainAreas): OBLIGATORIO MÍNIMO 4 bloques de competencias extraídos ESTRICTAMENTE del CV base. Adapta el título ligeramente al puesto, pero PROHIBIDO inventar competencias o áreas que no existan en el CV base.
       • HABILIDADES DESTACADAS (skills): Selecciona EXACTAMENTE entre 7 y 8 habilidades operativas clave ESTRICTAMENTE EXTRAÍDAS del CV base (NO inventes habilidades como "Manejo de TPV" si no están explícitamente en el CV base).
       • PROYECTOS PERSONALES: Selecciona EXACTAMENTE 4 proyectos del portafolio del CV base y readáptalos al puesto operativo. Cada proyecto debe tener un título claro y una descripción de al menos 2 frases completas conectando la iniciativa con el rol al que se postula. PROHIBIDO proyectos de tecnología compleja inapropiada para el nivel.
     * SI EL PUESTO ES MANDO MEDIO / ENCARGADO:
       • RESUMEN EJECUTIVO (3-4 frases): Equilibra la atención al cliente y ejecución operativa con liderazgo de tienda, control de KPIs y gestión de equipo.
       • OBLIGATORIO MÍNIMO 4 VIÑETAS POR CARGO. Equilibra la atención al cliente con métricas y liderazgo.
       • DOMINIOS: MÍNIMO 4 bloques de competencias ESTRICTAMENTE EXTRAÍDOS del CV base, combinando operativa y liderazgo. NO inventar.
     * SI EL PUESTO ES EJECUTIVO / DIRECTIVO:
       • RESUMEN EJECUTIVO (3-4 frases): Mantén tono de alto nivel, visión estratégica, transformación digital, IA e impacto financiero.
       • OBLIGATORIO MÍNIMO 4-5 VIÑETAS POR CARGO con métricas reales del CV base (20M clientes, 52 tiendas, 110.000€, 160.000 clientes/mes).
       • DOMINIOS: MÍNIMO 5 bloques de competencias ESTRICTAMENTE EXTRAÍDOS del CV base. NO inventar.

3. REGLAS GENERALES Y CANTIDADES ESTRICTAS:
   - PROYECTOS PERSONALES (Portafolio): Selecciona EXACTAMENTE 4 proyectos del portafolio del CV Base. Adapta su descripción al puesto, pero basándote en los títulos y descripciones reales ya existentes en el CV base. PROHIBIDO inventar proyectos inexistentes.
   - CERTIFICACIONES: Selecciona OBLIGATORIAMENTE entre 6 y 8 certificaciones del listado real del CV base que sean más relevantes para el puesto.
   - NO INVENTES NADA NUEVO. Re-enfoca y reescribe la información real ya existente en el CV base.

4. REGLAS GRAMATICALES Y DE ESTILO (¡CUMPLIMIENTO ESTRICTO!):
   - REGLA GRAMATICAL SAGRADA (E/Y y U/O): Está ESTRICTAMENTE PROHIBIDO escribir "y" antes de palabras que inicien con sonido "i" o "hi" (Ejemplo PROHIBIDO: "Desarrollé y implementé", DEBE SER "Desarrollé e implementé"; PROHIBIDO: "Creatividad y innovación", DEBE SER "Creatividad e innovación"). De igual forma, reemplaza "o" por "u" antes de sonido "o" u "ho".
   - Usa un lenguaje HUMANO, PERSUASIVO Y ADECUADO AL NIVEL DEL PUESTO.

5. CARTA DE PRESENTACIÓN (ESTILO LIMPIO, DIRECTO Y ELEGANTE — 4 PÁRRAFOS RICOS):
   - TONO Y ESTILO: Claro, profesional, sobrio, seguro. Sin cursilerías ni frases vacías. Redacción en primera persona del singular.
   - LONGITUD OBLIGATORIA: Exactamente 4 párrafos, cada uno de al menos 2-3 frases completas (separados por \n\n).
   - ESTRUCTURA OBLIGATORIA (adapta el contenido al puesto real, NO copies plantillas):
     1. Párrafo 1 — Presentación directa y sincera: Saludo "Estimado/a Director/a de Selección," + frase de presentación al puesto específico por su nombre real (extraído de la oferta). Menciona brevemente tu motivación genuina por ese tipo de rol (atención al cliente, operaciones, liderazgo, etc. según el nivel del puesto).
     2. Párrafo 2 — Trayectoria real y logros concretos: Describe con autenticidad tu experiencia de 18 años extrayendo 2-3 logros o responsabilidades REALES y específicas del CV base (ej: gestión de 52 centros, migración de 20 millones de clientes, ahorro de 110.000€, liderazgo de 48 gestores). Adapta los logros al nivel del puesto (para operativo: destaca la gestión directa de equipos, servicio al cliente, etc.).
     3. Párrafo 3 — Conexión directa con el puesto: Conecta 2-3 de tus competencias REALES del CV base con los requisitos específicos de la oferta (sin inventar nada). Sé específico y concreto, no genérico.
     4. Párrafo 4 — Cierre respetuoso y directo: "Quedo a su entera disposición para ampliar los detalles de mi trayectoria en una entrevista personal. Agradezco de antemano el tiempo dedicado a revisar mi perfil."
   - PROHIBICIONES ABSOLUTAS:
     • PROHIBIDO incluir despedida tipo "Atentamente" o el nombre del candidato al final (el sistema renderiza el bloque de firma dinámicamente).
     • PROHIBIDO inventar áreas, empresas o logros que no están en el CV base.
     • PROHIBIDO usar lenguaje cursi, adulador o frases hechas como "Me identifico plenamente con los valores de...".
     • PROHIBIDO párrafos de menos de 2 frases.
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
    
    // ESCUDO DE SEGURIDAD 1: Garantizar las 4 experiencias reales del CV Base, asociando por título/empresa para evitar mezcla si la IA las desordena
    const aiExperiences = parsedData?.tailoredCV?.experience || [];
    parsedData.tailoredCV = parsedData.tailoredCV || {};
    parsedData.tailoredCV.experience = baseCV.experience.map((baseExp) => {
      // Buscar la experiencia correspondiente en la respuesta de la IA (por título o empresa)
      const aiExp = aiExperiences.find((ai: any) => 
        (ai.title && ai.title.toLowerCase().trim() === baseExp.title.toLowerCase().trim()) || 
        (ai.company && ai.company.toLowerCase().trim() === baseExp.company.toLowerCase().trim())
      );

      // Tomar viñetas de la IA si existen y son válidas, sino usar las del CV base
      const rawDescription = (aiExp?.description && Array.isArray(aiExp.description) && aiExp.description.length >= 2)
        ? aiExp.description
        : baseExp.description;

      // Filtrar viñetas absurdas
      const cleanDescription = rawDescription.filter((descLine: string) => {
        const lower = descLine.toLowerCase();
        return !lower.includes('mermelada') && !lower.includes('autoservicio');
      });

      return {
        title: baseExp.title,       // Inmutable: título real del CV base
        company: baseExp.company,   // Inmutable: empresa real del CV base
        period: baseExp.period,
        location: baseExp.location,
        description: cleanDescription.length >= 2 ? cleanDescription : baseExp.description
      };
    });

    // ESCUDO DE SEGURIDAD 2: Forzar título de proyectos como "Proyectos Personales"
    if (parsedData?.tailoredCV) {
      parsedData.tailoredCV.portfolioTitle = 'Proyectos Personales';
    }

    // ESCUDO DE SEGURIDAD 3: Eliminar duplicados de "Atención al Cliente" entre skills y domainAreas
    if (parsedData?.tailoredCV?.domainAreas && Array.isArray(parsedData.tailoredCV.domainAreas)) {
      const skillsSet = new Set((parsedData.tailoredCV.skills || []).map((s: string) => s.toLowerCase()));
      parsedData.tailoredCV.domainAreas = parsedData.tailoredCV.domainAreas.filter((domain: any) => {
        return !skillsSet.has(domain.title?.toLowerCase());
      });
    }

    // ESCUDO DE SEGURIDAD 4: Eliminar firmas dobles al final de la carta
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
