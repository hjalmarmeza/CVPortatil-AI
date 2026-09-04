import type { BaseCV } from '../data/baseCV';

const DEEPINFRA_API_URL = 'https://api.deepinfra.com/v1/openai/chat/completions';
const MODEL = 'meta-llama/Meta-Llama-3.1-405B-Instruct';

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
Eres un experto redactor de CVs y cartas de presentación profesionales.
A continuación te proporciono el CV base de un candidato, la descripción de una oferta laboral y la información de la empresa objetivo.

CV BASE:
${JSON.stringify(baseCV, null, 2)}

OFERTA LABORAL:
${jobDescription}

EMPRESA A LA QUE SE POSTULA / AGENCIA DE SELECCIÓN:
${companyName.trim() ? companyName : 'Si no se especifica, redacta el CV de forma imparcial enfocado en la posición solicitada.'}

CALIBRACIÓN DE SENIORIDAD Y NIVEL REQUERIDO:
${seniorityLevel === 'operational' 
  ? 'OBLIGATORIO: NIVEL OPERATIVO / TIENDA (Dependiente/a, Cajero/a, Reponedor/a, Auxiliar). Re-enfocar TODO el CV para evitar sobrecualificación.' 
  : seniorityLevel === 'middle' 
  ? 'NIVEL MANDO MEDIO / ENCARGADO DE TIENDA (Liderazgo de equipo, gestión operativa, KPIs, turno).' 
  : seniorityLevel === 'executive' 
  ? 'NIVEL EJECUTIVO / DIRECTIVO (Estrategia, Transformación Digital, Dirección Regional, Presupuestos).' 
  : 'AUTO-DETECTAR NIVEL SEGÚN LA OFERTA LABORAL: Analizar si el puesto es operativo/tienda, mando medio o ejecutivo, y calibrar la experiencia en consecuencia.'}

TAREA:
1. ADAPTACIÓN REALISTA Y SIN CLICHÉS (¡CERO ADULACIÓN O HABILIDADES INVENTADAS!):
   - PROHIBIDO MENCIONAR ÁREAS QUE NO ESTÉN EN EL CV BASE: NUNCA menciones 'marketing', 'finanzas corporativas' o áreas en las que el candidato no ha trabajado. Mantén la historia estrictamente en Operaciones, Atención al Cliente, Gestión de Tiendas/Call Center, Liderazgo de Equipos y Transformación Digital/IA.
   - LA REDACCIÓN DEBE SER HUMANA, REALISTA, AUTÉNTICA Y SOBRIA.

2. ADAPTACIÓN Y CALIBRACIÓN DE SENIORIDAD DEL CV (REGLA CRÍTICA ANTI-SOBRECUALIFICACIÓN):
   - DEBES INCLUIR TODAS LAS EXPERIENCIAS LABORALES EXACTAS del CV Base. ESTÁ ESTRICTAMENTE PROHIBIDO ELIMINAR O DUPLICAR CARGOS.
   - PROHIBIDO INVENTAR O CAMBIAR LOS NOMBRES DE LAS EMPRESAS (company). Sin embargo, TIENES PERMISO DE ADAPTAR el nombre del puesto (title) para resaltar tu función real según el nivel del puesto (ej. si eres 'Gestor de Negocio Familiar & Consultor IA' y aplicas a tienda, puedes poner 'Gestor de Tienda y Atención al Cliente' siempre que no sea mentira). PROHIBIDO inventar tareas absurdas.
   - REGLA DE CALIBRACIÓN DE SENIORIDAD:
${seniorityLevel === 'operational' ? `      * PUESTO OPERATIVO / TIENDA / ATENCIÓN AL CLIENTE:
        • RESUMEN PROFESIONAL (3-4 frases): Adapta la presentación para un rol de tienda PERO manteniendo la dignidad de su experiencia real (ej. "Profesional con sólida experiencia en...", "Gestor especializado en..."). PROHIBIDO iniciar diciendo "Dependiente de Tienda", "Cajero" o similares. Enfoca la trayectoria en resolución de problemas, trato al cliente, ventas y soporte. PROHIBIDO usar lenguaje de "Alta Dirección".
        • EXPERIENCIA LABORAL: DEBE REDACTARSE EN PRIMERA PERSONA DEL SINGULAR ACTIVA (ej: "Gestioné...", "Atendí...", "Apoyé...", "Resolví..."). OBLIGATORIO EXACTAMENTE 3 VIÑETAS POR CARGO. Cada viñeta debe ser una ORACIÓN COMPLETA Y DETALLADA DE MÍNIMO 15 PALABRAS (ej. "Gestioné de manera integral el inventario de la tienda asegurando el stock diario para garantizar la satisfacción del cliente..."). ESTRICTAMENTE PROHIBIDO USAR TÍTULOS CORTOS. PROHIBIDO REPETIR VIÑETAS ENTRE CARGOS, CADA CARGO DEBE TENER SUS PROPIAS VIÑETAS ÚNICAS ADAPTADAS DE SU CONTEXTO ORIGINAL. Reescribe las funciones del CV base reenfocándolos HASTA EL EXTREMO hacia la ejecución operativa y trato directo al cliente.
        • DOMINIOS: MÍNIMO 4 bloques de competencias ESTRICTAMENTE EXTRAÍDOS del CV base, seleccionando solo los más operativos y de servicio.`
: seniorityLevel === 'middle' ? `      * PUESTO MANDO MEDIO / SUPERVISOR:
        • RESUMEN EJECUTIVO (3-4 frases): Equilibra la atención al cliente y ejecución operativa con liderazgo, control de KPIs y gestión de equipo. PROHIBIDO degradar el título del candidato a "Encargado de Tienda". El candidato debe presentarse como Supervisor o Gestor.
        • EXPERIENCIA LABORAL: OBLIGATORIO EXACTAMENTE 3 VIÑETAS POR CARGO. Cada viñeta debe ser una ORACIÓN COMPLETA Y DETALLADA. Equilibra la atención al cliente con métricas y liderazgo.
        • DOMINIOS: MÍNIMO 4 bloques de competencias ESTRICTAMENTE EXTRAÍDOS del CV base.`
: `      * PUESTO EJECUTIVO / DIRECTIVO:
        • RESUMEN PROFESIONAL (3-4 frases): Mantén tono de alto nivel, visión estratégica, transformación digital, IA e impacto financiero (ej. "Ejecutivo de Operaciones").
        • EXPERIENCIA LABORAL: OBLIGATORIO EXACTAMENTE 3 VIÑETAS POR CARGO. Cada viñeta debe ser una ORACIÓN COMPLETA con métricas reales del CV base.
        • DOMINIOS: MÍNIMO 5 bloques de competencias ESTRICTAMENTE EXTRAÍDOS del CV base.`}

3. REGLAS GENERALES Y CANTIDADES ESTRICTAS (ANTI-ALUCINACIONES):
   - CERO ALUCINACIONES: Prohibido inventar habilidades o métricas falsas. El CV debe ser 100% verídico.
   - REGLA SAGRADA DE VERACIDAD (PROHIBIDO INVENTAR CARGOS O SECTORES): La IA tiene estrictamente prohibido cambiar la industria raíz de la experiencia del candidato. Hjalmar ha trabajado en el sector de las Telecomunicaciones, Canales de Atención Masiva y Gestión de Negocios. NUNCA inventes que ha trabajado en "Supermercados", "Hostelería", "Retail de alimentación" o sectores ajenos.
   - CÓMO ADAPTAR EL TÍTULO SIN MENTIR: Si aplica a un puesto de Encargado en otra industria, el título del puesto debe reflejar su rol funcional real (ej. "Supervisor de Operaciones", "Supervisor Regional", "Responsable de Canales de Atención" o "Gestor de Negocio"). Lo que se adapta es el enfoque de las tareas (destacar la atención al cliente, los KPIs o el liderazgo de equipos), pero el cargo histórico y la empresa deben ser 100% verídicos.
   - PROYECTOS PERSONALES (portfolio): Es OBLIGATORIO incluir el array "portfolio" en el JSON con EXACTAMENTE 4 proyectos reales del CV Base. NUNCA lo omitas ni lo dejes vacío.
   - Habilidades (skills): NO INVENTES NINGUNA HABILIDAD NUEVA. Selecciona OBLIGATORIAMENTE EXACTAMENTE 5 habilidades clave del CV base que tengan la mayor coincidencia con los requisitos de la oferta laboral objetivo.
   - CERTIFICACIONES: Selecciona OBLIGATORIAMENTE entre 6 y 10 certificaciones del listado real del CV base.
   - Resumen Profesional (summary): Debe empezar obligatoriamente con el título PROFESIONAL REAL DEL CANDIDATO (Ej. "Supervisor de Operaciones", "Gestor de Negocio", "Líder de Equipo" o "Ejecutivo"). ESTRICTAMENTE PROHIBIDO iniciar el resumen llamando al candidato "Encargado de Tienda", "Dependiente", "Cajero" o cualquier título inferior a su experiencia real, incluso si aplica a ese puesto. El candidato es un Supervisor/Gestor postulando al rol, no pierdas su jerarquía en la presentación. PROHIBIDO inventar conocimientos falsos. REGLA SAGRADA: Queda ESTRICTAMENTE PROHIBIDO mencionar "telecomunicaciones" o sectores ajenos a menos que la oferta sea expresamente de telecomunicaciones. Escribe un resumen de OBLIGATORIAMENTE ENTRE 100 Y 120 PALABRAS (4 a 5 frases completas, fluidas y persuasivas directamente enfocadas al rol solicitado).
   - Dominios Técnicos y Competencias (domainAreas): ESTRICTAMENTE OBLIGATORIO seleccionar y adaptar EXACTAMENTE 5 áreas clave (competencias) del CV base que mejor respondan a las necesidades de la oferta. PROHIBIDO DEVOLVER MENOS O MÁS DE 5.
   - Experiencia (experience): Es OBLIGATORIO procesar y devolver EXACTAMENTE EL MISMO NÚMERO DE EXPERIENCIAS que el CV Base. PROHIBIDO AÑADIR EXPERIENCIAS FANTASMAS O DIVIDIRLAS. Adapta el tono al nivel de la oferta. REGLA CRÍTICA: Cada cargo DEBE tener EXACTAMENTE 3 viñetas (descriptions). Las viñetas deben ser ORACIONES COMPLETAS Y DETALLADAS (MÍNIMO 15 PALABRAS POR VIÑETA), explicando la acción y el resultado. QUEDA ESTRICTAMENTE PROHIBIDO poner solo 2, 3 o 7 palabras como "Atención al cliente" o "Gestión de inventarios". Debes redactar la oración completa. ESTRICTAMENTE PROHIBIDO REPETIR VIÑETAS, CADA EXPERIENCIA DEBE TENER UN TEXTO ÚNICO.

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
    let response;
    let retries = 3;
    let attempt = 0;
    while (attempt < retries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s por intento
      
      try {
        response = await fetch(DEEPINFRA_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: 2500
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.ok) break;
        if (response.status === 429 || response.status >= 500) {
          throw new Error('Server error or rate limit');
        } else {
          break; // Don't retry on 400 Bad Request
        }
      } catch (err) {
        clearTimeout(timeoutId);
        attempt++;
        if (attempt >= retries) throw err;
        await new Promise(r => setTimeout(r, attempt * 3000));
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Error en la API de DeepInfra: ${response ? response.status : 'Desconocido'}`);
    }

    const data = await response.json();
    let cleanContent = data.choices[0].message.content.trim();
    cleanContent = cleanContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

    let parsedData: any;
    try {
      parsedData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.warn("JSON Parse warning, attempting auto-repair...", parseError);
      try {
        let repaired = cleanContent;
        if ((repaired.match(/"/g) || []).length % 2 !== 0) {
          repaired += '"';
        }
        const openBrackets = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length;
        const openBraces = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length;
        for (let i = 0; i < Math.max(0, openBrackets); i++) repaired += ']';
        for (let i = 0; i < Math.max(0, openBraces); i++) repaired += '}';
        parsedData = JSON.parse(repaired);
      } catch (fatalError) {
        console.error("Fatal JSON error, using baseCV fallback:", fatalError);
        parsedData = { tailoredCV: { ...baseCV } };
      }
    }
    // NORMALIZAR EL ENVOLTORIO
    if (!parsedData.tailoredCV) {
      if (parsedData.summary || parsedData.experience) {
        parsedData = { tailoredCV: parsedData };
      } else {
        parsedData = { tailoredCV: { ...baseCV } };
      }
    }

    // ESCUDOS DE SEGURIDAD EXTREMA:
    // LÓGICA CONDICIONAL DE CONTROL DEL PORTAFOLIO SEGÚN SENIORIDAD
    if (seniorityLevel === 'operational' || seniorityLevel === 'middle') {
      parsedData.tailoredCV.portfolio = [];
    } else {
      parsedData.tailoredCV.portfolio = baseCV.portfolio.slice(0, 4);
    }
    if (!parsedData.tailoredCV.domainAreas || parsedData.tailoredCV.domainAreas.length < 4) {
      parsedData.tailoredCV.domainAreas = baseCV.domainAreas.slice(0, 4);
    }
    if (!parsedData.tailoredCV.certifications || parsedData.tailoredCV.certifications.length < 5) {
      parsedData.tailoredCV.certifications = baseCV.certifications.slice(0, 6);
    }
    parsedData.tailoredCV.education = baseCV.education;
    parsedData.tailoredCV.languages = baseCV.languages;
    if (typeof parsedData.coverLetter === 'string') {
      parsedData.coverLetter = parsedData.coverLetter.split(/\\n+/);
    }
    // ESCUDO DE SEGURIDAD 1: Garantizar las experiencias reales del CV Base
    const aiExperiences = parsedData?.tailoredCV?.experience || [];
    parsedData.tailoredCV = parsedData.tailoredCV || {};
    parsedData.tailoredCV.experience = baseCV.experience.map((baseExp, index) => {
      // Buscar la experiencia correspondiente por nombre de empresa preferentemente para evitar desfases
      let aiExp = aiExperiences[index];
      const matchByCompany = aiExperiences.find((e: any) => e.company && baseExp.company && e.company.toLowerCase() === baseExp.company.toLowerCase() && e.title === baseExp.title);
      if (aiExp && aiExp.company && baseExp.company && aiExp.company.toLowerCase() !== baseExp.company.toLowerCase()) {
        aiExp = matchByCompany || aiExp;
      }

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
        title: aiExp?.title || baseExp.title, // Permitir que la IA adapte el título al nivel
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

    // ESCUDO DE SEGURIDAD 4: Fallback eliminado ya que la carta ahora se genera por separado.

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

  const prompt = `Eres un experto redactor especializado en cartas de presentación corporativas y comerciales en español.

CALIBRACIÓN DE SENIORIDAD:
${_seniorityLevel === 'operational' 
  ? 'OBLIGATORIO: El puesto es NIVEL OPERATIVO / TIENDA. Redacta la carta enfocada en el servicio al cliente, dinamismo, resolución de problemas y ventas. NO uses tono de directivo ni hables de transformación digital.' 
  : _seniorityLevel === 'middle' 
  ? 'NIVEL MANDO MEDIO / ENCARGADO. Enfoca en liderazgo de equipos, control de tienda y atención al cliente.' 
  : 'NIVEL EJECUTIVO. Mantén tono de alto nivel, visión estratégica, operaciones complejas y transformación digital.'}
Toma la siguiente oferta de trabajo y genera una Carta de Presentación de EXACTAMENTE 4 párrafos (de 45 a 55 palabras cada uno), adaptando la narrativa a las necesidades, retos e industria de la oferta.

REGLAS ABSOLUTAS Y OBLIGATORIAS:
- ESTILO: Sobrio, elegante, persuasivo y cualitativo.
- PROHIBIDO INCLUIR NÚMEROS O CIFRAS (nada de 18 años, 20M, 48 gestores, 52 centros, 110.000€, etc.).
- PROHIBIDO MENCIONAR NOMBRES DE EMPRESAS PASADAS (como Telefónica) O PUESTOS ANTERIORES.
- PROHIBIDO MENCIONAR NOMBRES DE HERRAMIENTAS O METODOLOGÍAS DE IA (nada de ChatGPT, Gemini, Azure, NPS, FCR, etc.).
- ESTRUCTURA DE 4 PÁRRAFOS:
  1. Párrafo 1: Presentación sincera motivada por el puesto objetivo, destacando cómo su experiencia encaja con la oferta.
  2. Párrafo 2: Trayectoria adaptada al puesto (si es tienda: atención al cliente, ventas y soporte; si es ejecutivo: gestión de operaciones y optimización de procesos).
  3. Párrafo 3: Enfoque en adaptabilidad, innovación y habilidades alineadas a la cultura de la empresa.
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
    let response;
    let retries = 3;
    let attempt = 0;
    while (attempt < retries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s por intento
      
      try {
        response = await fetch(DEEPINFRA_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 1500
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) break;
        if (response.status === 429 || response.status >= 500) {
          throw new Error('Server error or rate limit');
        } else {
          break; // Don't retry on 400 Bad Request
        }
      } catch (err) {
        clearTimeout(timeoutId);
        attempt++;
        if (attempt >= retries) throw err;
        await new Promise(r => setTimeout(r, attempt * 3000));
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Error en la API de DeepInfra: ${response ? response.status : 'Desconocido'}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    if (parsed.coverLetter && Array.isArray(parsed.coverLetter) && parsed.coverLetter.length >= 4) {
      return sanitizeObjectGrammar({ coverLetter: parsed.coverLetter }).coverLetter;
    }
  } catch (err) {
    console.error('Error generando carta independiente:', err);
  }

  // Fallback cualitativo de alta densidad en 0ms
  if (_seniorityLevel === 'operational') {
    return [
      `Estimado/a Director/a de Selección,`,
      `Me dirijo a usted con el propósito de presentar mi candidatura a la posición solicitada, motivado por el deseo de aportar mi compromiso, dinamismo y orientación al servicio en su equipo. A lo largo de mi trayectoria, he desarrollado una sólida capacidad para garantizar la satisfacción del cliente y la eficiencia en las operaciones del día a día.`,
      `Mi experiencia me ha permitido perfeccionar habilidades clave en la resolución rápida de problemas, el trabajo en equipo y el trato directo al público. Entiendo la importancia de representar los valores de la empresa ante cada cliente, manteniendo siempre un trato profesional, cercano y resolutivo.`,
      `Asimismo, me caracterizo por mi gran adaptabilidad, facilidad de aprendizaje y proactividad para mantener los estándares de calidad y orden que exige este sector. Estoy seguro de que mi entusiasmo y mi experiencia operativa serán de gran valor para su equipo.`,
      `Agradezco de antemano el tiempo dedicado a revisar mi perfil. Quedo a su entera disposición para concertar una entrevista y conversar sobre cómo puedo sumar positivamente a su empresa.`
    ];
  } else if (_seniorityLevel === 'middle') {
    return [
      `Estimado/a Director/a de Selección,`,
      `Me dirijo a usted para presentar mi candidatura a la posición solicitada. Con una sólida trayectoria coordinando equipos y gestionando la operativa diaria, me motiva la oportunidad de aportar mi experiencia en liderazgo y orientación a resultados a su organización.`,
      `A lo largo de mi carrera, me he especializado en equilibrar la excelencia en la atención al cliente con el cumplimiento estricto de los KPIs del negocio. He supervisado turnos, coordinado personal y asegurado que los procesos internos se ejecuten de manera fluida y eficiente, resolviendo los incidentes con agilidad.`,
      `Considero que el éxito de cualquier centro o tienda radica en un equipo motivado y en procesos bien estructurados. Por ello, destaco por mi capacidad para comunicar objetivos, formar al talento y mantener un entorno de trabajo colaborativo que impacte positivamente en la rentabilidad y en la experiencia del cliente.`,
      `Quedo a su entera disposición para mantener una entrevista en la que podamos profundizar sobre cómo mi experiencia en mando medio aportará valor a su equipo. Agradezco de antemano su atención.`
    ];
  } else {
    return [
      `Estimado/a Director/a de Selección,`,
      `Me dirijo a usted con el propósito de presentar mi candidatura a la posición solicitada, motivado por la oportunidad de contribuir de manera significativa al crecimiento y a la excelencia operativa de su organización. A lo largo de mi trayectoria profesional, he desarrollado una visión estratégica enfocada en la optimización de procesos y el liderazgo de equipos orientados a resultados.`,
      `Mi experiencia se ha centrado en orquestar operaciones complejas y coordinar servicios de alta demanda, asegurando siempre estándares superiores de calidad y eficiencia. He liderado iniciativas de modernización de infraestructura y virtualización de procesos, logrando estabilizar la atención al usuario, reducir costos operativos y garantizar la continuidad del negocio en entornos cambiantes.`,
      `Asimismo, destaco por mi capacidad para promover la transformación digital y la adopción de nuevas metodologías de trabajo. Entiendo la innovación no solo como una evolución tecnológica, sino como un proceso continuo de mejora, adaptabilidad y desarrollo del talento humano para responder con agilidad a las exigencias del mercado.`,
      `Quedo a su entera disposición para mantener una entrevista personal en la que pueda profundizar en cómo mi perfil ejecutivo, mi capacidad de gestión y mi compromiso profesional aportarán un valor tangible a los objetivos de su empresa. Agradezco de antemano el tiempo y la consideración brindados.`
    ];
  }
};
