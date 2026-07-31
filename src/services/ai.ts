import axios from 'axios';
import type { BaseCV } from '../data/baseCV';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => {
    return retryCount * 2000; // time interval between retries
  },
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return !!(axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED' || (error.response && error.response.status === 429));
  }
});

const DEEPINFRA_API_URL = 'https://api.deepinfra.com/v1/openai/chat/completions';
const MODEL = 'meta-llama/Meta-Llama-3.1-70B-Instruct';

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
1. ADAPTACIÓN REALISTA Y SIN CLICHÉS (¡CERO ADULACIÓN O HABILIDADES INVENTADAS!):
   - PROHIBIDO MENCIONAR ÁREAS QUE NO ESTÉN EN EL CV BASE: NUNCA menciones 'marketing', 'finanzas corporativas' o áreas en las que el candidato no ha trabajado. Mantén la historia estrictamente en Operaciones, Atención al Cliente, Gestión de Tiendas/Call Center, Liderazgo de Equipos y Transformación Digital/IA.
   - ESTRUCTURA OBLIGATORIA Y TONO DE LA CARTA (PROHIBIDO HACER CARTAS CORTAS O SIMPLES):
     1. Párrafo 1 — Presentación directa y sincera: Saludo "Estimado/a Director/a de Selección," + "Es un placer presentar mi candidatura para el puesto de [Nombre del Puesto]. Como profesional apasionado por el sector y la atención al cliente, estoy emocionado de unirme a un equipo que comparte mis valores y objetivos."
     2. Párrafo 2 — Desarrollo y Valor central: "Con más de 18 años de experiencia liderando equipos y gestionando operaciones, estoy seguro de que puedo aportar valor..." No menciones NINGÚN nombre de empresa pasada.
       • TÍTULO: Empieza con tu nombre, un salto de línea (\n), título del puesto al que postulas, seguido de tus datos de contacto.\n
       • CUERPO: La carta DEBE tener 4 párrafos extensos y detallados. Debes devolver un ARRAY de 4 strings, donde cada string es un párrafo. REGLA CRÍTICA INQUEBRANTABLE: Cada uno de los 4 párrafos debe tener una longitud aproximada de 90 a 110 palabras. Debe ser sustancial y detallado. Usa un lenguaje natural, persuasivo y humano, sin sonar excesivamente robótico o poético. Usa la carta base como esqueleto pero adáptala para que suene inspiradora y orientada al puesto (ej. si es Director de Tienda, enfócate en excelencia operativa en Retail).\n
     4. Párrafo 4 — Cierre proactivo: "Estoy emocionado de unirme a su equipo y contribuir al éxito de su empresa. Agradezco de antemano el tiempo dedicado a revisar mi perfil." + "Atentamente," + "Hjalmar Meza Cortez".
   - REGLA CRÍTICA DE CONTEXTO: PROHIBIDO listar tus trabajos anteriores o empresas. PROHIBIDO decir "En mi experiencia como [puesto] en [empresa]". La carta debe ser sobre tus valores, habilidades transversales y lo que puedes aportar.
   - Mantén un volumen, profundidad y peso narrativo altos. Mínimo 4 párrafos extensos. PROHIBIDO usar frases como "Me siento atraído por la cultura de...", "Me identifico plenamente con los valores de...", "Quedo a su disposición para discutir cómo mi visión...", "empresa solicitante".
   - LA REDACCIÓN DEBE SER HUMANA, REALISTA, AUTÉNTICA Y SOBRIA.

2. ADAPTACIÓN Y CALIBRACIÓN DE SENIORIDAD DEL CV (REGLA CRÍTICA ANTI-SOBRECUALIFICACIÓN):
   - DEBES INCLUIR TODAS LAS EXPERIENCIAS LABORALES EXACTAS del CV Base. ESTÁ ESTRICTAMENTE PROHIBIDO ELIMINAR O DUPLICAR CARGOS.
   - PROHIBIDO INVENTAR O CAMBIAR LOS NOMBRES DE LAS EMPRESAS (company) Y NOMBRES DE PUESTOS (title) DEL CV BASE. Cada elemento en 'experience' DEBE CONSERVAR EXACTAMENTE el mismo 'title', 'company', 'period' y 'location' original del CV Base. PROHIBIDO inventar puestos como "Director/a de Tienda" si el puesto base es "Gestor de Negocio Familiar & Consultor IA". PROHIBIDO inventar tareas absurdas (como mermeladas, bases de datos relacionales en tienda o alianzas internacionales sin sentido).
   - REGLA DE CALIBRACIÓN DE SENIORIDAD:
     * SI EL PUESTO ES DE NIVEL OPERATIVO / TIENDA (ej: Dependiente/a, Reponedor/a, Cajero/a, Auxiliar, Atención al Cliente):
       • RESUMEN EJECUTIVO (OBLIGATORIAMENTE 3-4 frases completas adaptadas al puesto operativo): Presenta al candidato como profesional apasionado por la atención al cliente, el servicio de excelencia, la gestión del punto de venta, el trabajo en equipo y la resolución de incidencias. Extrae la información del CV base (18 años de trayectoria, liderazgo de equipos, experiencia en operaciones de tienda). NO inventes nada, REUTILIZA y ADAPTA lo que ya está en el CV base al tono operativo del puesto.
       • EXPERIENCIA LABORAL: DEBE REDACTARSE EN PRIMERA PERSONA DEL SINGULAR ACTIVA (ej: "Lideré...", "Desarrollé...", "Implementé...", "Supervisé...", "Optimicé..."). OBLIGATORIO MÍNIMO 4 VIÑETAS POR CARGO. CADA VIÑETA DEBE SER LARGA Y EXHAUSTIVA (mínimo 15 a 20 palabras). Reescribe las funciones y logros del CV base reenfocándolos hacia la ejecución operativa del puesto (atención directa al cliente, gestión del punto de venta, trabajo en equipo, cumplimiento de objetivos). Conserva el cargo real y empresa real del CV base.
       • DOMINIOS Y COMPETENCIAS (domainAreas): OBLIGATORIO MÍNIMO 4 bloques de competencias extraídos ESTRICTAMENTE del CV base. Adapta el título ligeramente al puesto, pero PROHIBIDO inventar competencias o áreas que no existan en el CV base.
       • HABILIDADES DESTACADAS (skills): Selecciona EXACTAMENTE 5 habilidades operativas clave ESTRICTAMENTE EXTRAÍDAS del CV base (NO inventes habilidades como "Manejo de TPV" si no están explícitamente en el CV base).
       • PROYECTOS PERSONALES: Selecciona EXACTAMENTE 4 proyectos del portafolio del CV base y readáptalos al puesto operativo. Cada proyecto debe tener un título claro y una descripción de al menos 2 frases completas conectando la iniciativa con el rol al que se postula. PROHIBIDO proyectos de tecnología compleja inapropiada para el nivel.
     * SI EL PUESTO ES MANDO MEDIO / ENCARGADO:
       • RESUMEN EJECUTIVO (3-4 frases): Equilibra la atención al cliente y ejecución operativa con liderazgo de tienda, control de KPIs y gestión de equipo.
       • OBLIGATORIO MÍNIMO 4 VIÑETAS POR CARGO. Equilibra la atención al cliente con métricas y liderazgo.
       • DOMINIOS: MÍNIMO 4 bloques de competencias ESTRICTAMENTE EXTRAÍDOS del CV base, combinando operativa y liderazgo. NO inventar.
     * SI EL PUESTO ES EJECUTIVO / DIRECTIVO:
       • RESUMEN EJECUTIVO (3-4 frases): Mantén tono de alto nivel, visión estratégica, transformación digital, IA e impacto financiero.
       • OBLIGATORIO MÍNIMO 4-5 VIÑETAS POR CARGO con métricas reales del CV base (20M clientes, 52 tiendas, 110.000€, 160.000 clientes/mes).
       • DOMINIOS: MÍNIMO 5 bloques de competencias ESTRICTAMENTE EXTRAÍDOS del CV base. NO inventar.

3. REGLAS GENERALES Y CANTIDADES ESTRICTAS (ANTI-ALUCINACIONES):
   - PROHIBIDO INVENTAR DATOS: BAJO NINGUNA CIRCUNSTANCIA puedes inventar métricas, porcentajes (ej. "15%"), cifras o logros que no estén EXPRESAMENTE escritos en el CV Base. Si el CV base no tiene un porcentaje, NO LO INVENTES.
   - PROYECTOS PERSONALES (portfolio): Es OBLIGATORIO incluir el array "portfolio" en el JSON con EXACTAMENTE 4 proyectos reales del CV Base. NUNCA lo omitas ni lo dejes vacío.
   - Habilidades (skills): NO INVENTES NINGUNA HABILIDAD NUEVA. Selecciona OBLIGATORIAMENTE EXACTAMENTE 5 habilidades clave del CV base que tengan la mayor coincidencia con los requisitos de la oferta laboral objetivo. REGLA CRÍTICA: NO generes habilidades o competencias que sean sinónimos o redundantes entre sí.
   - CERTIFICACIONES: Selecciona OBLIGATORIAMENTE entre 6 y 8 certificaciones del listado real del CV base. REGLA: PROHIBIDO incluir cursos o programas que ya formen parte de la sección de Estudios.
   - Resumen Profesional (summary): Debe empezar obligatoriamente con el título exacto adaptado al puesto objetivo. Todo el párrafo debe personalizarse y orientarse explícitamente a las necesidades, desafíos e industria de la oferta de empleo introducida. REGLA ESTRICTA: PROHIBIDO incluir cifras, números, porcentajes o métricas. Escribe un resumen de OBLIGATORIAMENTE ENTRE 100 Y 120 PALABRAS (4 a 5 frases completas, densas, directivas y persuasivas directamente enfocadas al rol solicitado).
   - Dominios Técnicos y Competencias (domainAreas): ESTRICTAMENTE OBLIGATORIO seleccionar y adaptar EXACTAMENTE 5 áreas clave (competencias) del CV base que mejor respondan a las necesidades de la oferta. PROHIBIDO DEVOLVER MENOS O MÁS DE 5.
   - Experiencia (experience): Es OBLIGATORIO procesar y devolver TODAS las experiencias laborales del CV Base sin omitir ninguna. Mantén un tono altamente profesional, directivo y estructurado. REGLA CRÍTICA: Cada cargo DEBE tener entre 3 y 5 viñetas extensas (descriptions). PROHIBIDO descripciones cortas o simples de una línea.

4. REGLAS GRAMATICALES Y DE ESTILO (¡CUMPLIMIENTO ESTRICTO!):
   - REGLA GRAMATICAL SAGRADA (E/Y y U/O): Está ESTRICTAMENTE PROHIBIDO escribir "y" antes de palabras que inicien con sonido "i" o "hi". De igual forma, reemplaza "o" por "u" antes de sonido "o" u "ho".
   - Usa un lenguaje HUMANO, PERSUASIVO Y ADECUADO AL NIVEL DEL PUESTO.

Devuelve la respuesta ÚNICAMENTE en el siguiente formato JSON, sin texto adicional (es muy importante que el JSON sea válido y no tenga markdown):
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
    "certifications": ["...", "..."]
  }
}
`;

  try {
    const response = await axios.post(
      DEEPINFRA_API_URL,
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 90000
      }
    );

    const content = response.data.choices[0].message.content;
    const parsedData = JSON.parse(content);
    
    // ESCUDOS DE SEGURIDAD EXTREMA:
    // Escudo de Hierro: Los proyectos personales no se tocan jamás.
    parsedData.tailoredCV.portfolio = baseCV.portfolio.slice(0, 4);
    if (!parsedData.tailoredCV.domainAreas || parsedData.tailoredCV.domainAreas.length < 4) {
      parsedData.tailoredCV.domainAreas = baseCV.domainAreas.slice(0, 4);
    }
    if (!parsedData.tailoredCV.certifications || parsedData.tailoredCV.certifications.length < 5) {
      parsedData.tailoredCV.certifications = baseCV.certifications.slice(0, 6);
    }
    if (typeof parsedData.coverLetter === 'string') {
      parsedData.coverLetter = parsedData.coverLetter.split(/\\n+/);
    }
    // ESCUDO DE SEGURIDAD 1: Garantizar las 4 experiencias reales del CV Base, asociando por título/empresa para evitar mezcla si la IA las desordena
    const aiExperiences = parsedData?.tailoredCV?.experience || [];
    parsedData.tailoredCV = parsedData.tailoredCV || {};
    parsedData.tailoredCV.experience = baseCV.experience.map((baseExp) => {
      // Buscar la experiencia correspondiente en la respuesta de la IA (SOLO por título exacto, ya que la empresa se repite y causaba cruces)
      const aiExp = aiExperiences.find((ai: any) => 
        ai.title && ai.title.toLowerCase().trim() === baseExp.title.toLowerCase().trim()
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

    // ESCUDO DE SEGURIDAD 4: Generación instantánea de Carta Cualitativa de 4 párrafos (0ms)
    const targetTitle = parsedData?.tailoredCV?.summary?.split('.')[0] || 'Director/a de Operaciones';
    parsedData.coverLetter = [
      `Estimado/a Director/a de Selección,`,
      `Me dirijo a usted con el propósito de presentar mi candidatura a la posición de ${targetTitle}, motivado por la oportunidad de contribuir de manera significativa al crecimiento y a la excelencia operativa de su organización. A lo largo de mi trayectoria profesional, he desarrollado una visión estratégica enfocada en la optimización de procesos y el liderazgo de equipos orientados a resultados.`,
      `Mi experiencia se ha centrado en orquestar operaciones complejas y coordinar servicios de alta demanda, asegurando siempre estándares superiores de calidad y eficiencia. He liderado iniciativas de modernización de infraestructura y virtualización de procesos, logrando estabilizar la atención al usuario, reducir costos operativos y garantizar la continuidad del negocio en entornos cambiantes.`,
      `Asimismo, destaco por mi capacidad para promover la transformación digital y la adopción de nuevas metodologías de trabajo. Entiendo la innovación no solo como una evolución tecnológica, sino como un proceso continuo de mejora, adaptabilidad y desarrollo del talento humano para responder con agilidad a las exigencias del mercado.`,
      `Quedo a su entera disposición para mantener una entrevista personal en la que pueda profundizar en cómo mi perfil ejecutivo, mi capacidad de gestión y mi compromiso profesional aportarán un valor tangible a los objetivos de su empresa. Agradezco de antemano el tiempo y la consideración brindados.`
    ];

    // Sanitización automática de gramática y cacofonías (ej. "y implementé" -> "e implementé")
    return sanitizeObjectGrammar(parsedData);
  } catch (error) {
    console.error('Error llamando a DeepInfra:', error);
    throw new Error('Hubo un error al generar el CV. Por favor, intenta nuevamente.');
  }
};

export const generateTailoredCoverLetter = async (
  jobDescription: string,
  _baseCV?: BaseCV,
  _companyName: string = '',
  _seniorityLevel: string = 'executive'
): Promise<string[]> => {
  const apiKey = import.meta.env.VITE_DEEPINFRA_API_KEY;
  if (!apiKey) {
    throw new Error('API Key no configurada');
  }

  const prompt = `Eres un redactor ejecutivo senior especializado en cartas de presentación de alto nivel en español.
Toma la siguiente oferta de trabajo y genera una Carta de Presentación de EXACTAMENTE 4 párrafos (de 45 a 55 palabras cada uno), adaptando la narrativa a las necesidades, retos e industria de la oferta.

REGLAS ABSOLUTAS Y OBLIGATORIAS:
- ESTILO: Sobrio, elegante, persuasivo y cualitativo.
- PROHIBIDO INCLUIR NÚMEROS O CIFRAS (nada de 18 años, 20M, 48 gestores, 52 centros, 110.000€, etc.).
- PROHIBIDO MENCIONAR NOMBRES DE EMPRESAS PASADAS (como Telefónica) O PUESTOS ANTERIORES.
- PROHIBIDO MENCIONAR NOMBRES DE HERRAMIENTAS O METODOLOGÍAS DE IA (nada de ChatGPT, Gemini, Azure, NPS, FCR, etc.).
- ESTRUCTURA DE 4 PÁRRAFOS:
  1. Párrafo 1: Presentación sincera motivada por el puesto objetivo, destacando la visión de liderazgo y aporte estratégico a su empresa.
  2. Párrafo 2: Trayectoria cualitativa en gestión de operaciones complejas, optimización de procesos y calidad en el servicio.
  3. Párrafo 3: Enfoque en transformación digital, innovación y desarrollo de equipos.
  4. Párrafo 4: Cierre profesional solicitando entrevista personal.

OFERTA DE TRABAJO:
${jobDescription}

Devuelve la respuesta ÚNICAMENTE en el siguiente formato JSON sin markdown:
{
  "coverLetter": [
    "Párrafo 1...",
    "Párrafo 2...",
    "Párrafo 3...",
    "Párrafo 4..."
  ]
}
`;

  try {
    const response = await axios.post(
      DEEPINFRA_API_URL,
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const content = response.data.choices[0].message.content;
    const parsed = JSON.parse(content);
    if (parsed.coverLetter && Array.isArray(parsed.coverLetter) && parsed.coverLetter.length >= 4) {
      return sanitizeObjectGrammar({ coverLetter: parsed.coverLetter }).coverLetter;
    }
  } catch (err) {
    console.error('Error generando carta independiente:', err);
  }

  // Fallback cualitativo de alta densidad en 0ms
  return [
    `Estimado/a Director/a de Selección,`,
    `Me dirijo a usted con el propósito de presentar mi candidatura a la posición solicitada, motivado por la oportunidad de contribuir de manera significativa al crecimiento y a la excelencia operativa de su organización. A lo largo de mi trayectoria profesional, he desarrollado una visión estratégica enfocada en la optimización de procesos y el liderazgo de equipos orientados a resultados.`,
    `Mi experiencia se ha centrado en orquestar operaciones complejas y coordinar servicios de alta demanda, asegurando siempre estándares superiores de calidad y eficiencia. He liderado iniciativas de modernización de infraestructura y virtualización de procesos, logrando estabilizar la atención al usuario, reducir costos operativos y garantizar la continuidad del negocio en entornos cambiantes.`,
    `Asimismo, destaco por mi capacidad para promover la transformación digital y la adopción de nuevas metodologías de trabajo. Entiendo la innovación no solo como una evolución tecnológica, sino como un proceso continuo de mejora, adaptabilidad y desarrollo del talento humano para responder con agilidad a las exigencias del mercado.`,
    `Quedo a su entera disposición para mantener una entrevista personal en la que pueda profundizar en cómo mi perfil ejecutivo, mi capacidad de gestión y mi compromiso profesional aportarán un valor tangible a los objetivos de su empresa. Agradezco de antemano el tiempo y la consideración brindados.`
  ];
};
