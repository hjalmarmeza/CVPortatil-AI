import axios from 'axios';
import type { BaseCV } from '../data/baseCV';

const DEEPINFRA_API_URL = 'https://api.deepinfra.com/v1/openai/chat/completions';
const MODEL = 'meta-llama/Meta-Llama-3-70B-Instruct'; // You can change this to another model available in DeepInfra

export const generateTailoredCV = async (jobDescription: string, baseCV: BaseCV) => {
  const apiKey = import.meta.env.VITE_DEEPINFRA_API_KEY;

  if (!apiKey) {
    throw new Error('API Key no configurada. Por favor, revisa .env.local');
  }

  const prompt = `
Eres un experto redactor de CVs y cartas de presentación ejecutivas.
A continuación te proporciono el CV base de un candidato y la descripción de una oferta laboral a la que quiere aplicar.

CV BASE:
${JSON.stringify(baseCV, null, 2)}

OFERTA LABORAL:
${jobDescription}

TAREA:
1. Analiza a fondo los requerimientos de la oferta laboral (dolores, necesidades, keywords).
2. ADAPTACIÓN DEL CV (EL CORAZÓN DE LA TAREA): 
   - ACTÚA COMO UN HEADHUNTER EXPERTO Y DIRECTIVO. Tu objetivo es "vender" a este candidato a la empresa demostrando su valor.
   - OBLIGATORIO - EXPERIENCIA LABORAL: DEBES INCLUIR TODAS LAS EXPERIENCIAS LABORALES EXACTAS del CV Base. ESTÁ ESTRICTAMENTE PROHIBIDO RECORTAR, RESUMIR, ELIMINAR O DUPLICAR CARGOS. Debes devolver la lista original de experiencias, re-escribiendo el 'summary' y las viñetas (description) de cada cargo para resaltar las habilidades de la oferta.
   - CONOCIMIENTOS ADICIONALES (Portafolio): Transforma cualquier mención a "aplicaciones creadas" en "Proyectos Personales". Genera EXACTAMENTE entre 3 y 4 proyectos personales adaptados al puesto (ESTÁ STRICTAMENTE PROHIBIDO devolver más de 4). Usa frases literales como "Diseño y desarrollo de aplicaciones para..." o "Implementación de sistemas en el ámbito de...". Explica claramente qué tipo de apps has creado y cómo aportan un inmenso valor estratégico y tecnológico al puesto que solicitas.
   - TÍTULO DE PORTAFOLIO ADAPTADO: OBLIGATORIO usar "Proyectos Personales" o "Proyectos de Innovación Tecnológica".
   - DOMINIOS EJECUTIVOS Y COMPETENCIAS (domainAreas): Selecciona entre 4 y 6 áreas de dominio del CV base que sean más relevantes para el puesto. Cada área tiene su lista de competencias (skills) de gestión y blandas. Los títulos son áreas ejecutivas: "Liderazgo Organizacional", "Transformación & IA", "Gestión de Operaciones", "Experiencia del Cliente (CX)", "Desarrollo Comercial", "Habilidades Humanas". PROHIBIDO poner herramientas tecnológicas aquí.
   - HABILIDADES / APTITUDES DESTACADAS (skills): Selecciona EXACTAMENTE entre 6 y 8 aptitudes destacadas del candidato que sean MÁS RELEVANTES para el puesto (ESTÁ ESTRICTAMENTE PROHIBIDO devolver más de 8 habilidades). Elige de la lista base: Resolución de Problemas, Toma de Decisiones, Análisis y Decisión Técnica, Productividad de IA, Agilidad Estratégica, Análisis de Tendencias, Empatía / CX, Creatividad e Innovación, Adaptabilidad, Pensamiento Crítico.
   - CERTIFICACIONES: Selecciona OBLIGATORIAMENTE entre 6 y 8 certificaciones relevantes al puesto. ESTÁ ESTRICTAMENTE PROHIBIDO devolver menos de 6 o más de 8 certificaciones.
   - NO INVENTES NADA NUEVO. Re-enfoca lo que ya existe. MANTÉN TODAS LAS CIFRAS de impacto intactas.
3. REGLAS DE ORO PARA EL TONO Y ESTILO:
   - Usa un lenguaje HUMANO pero ALTAMENTE PERSUASIVO Y PROFESIONAL. Debes sonar como un experto maduro, directivo y seguro de sí mismo.
   - EQUILIBRIO PERFECTO: No asustes al reclutador pareciendo "demasiado caro", pero DEMUESTRA sin lugar a dudas que eres el mejor candidato. Enfatiza tu bagaje táctico y estratégico ("hands-on").
4. CARTA DE PRESENTACIÓN (¡SIGUE ESTAS REGLAS AL PIE DE LA LETRA!):
   - LONGITUD OBLIGATORIA: La carta debe ser EXTENSA, PROFUNDA Y SUSTANCIOSA (Entre 320 y 380 palabras en total en el cuerpo). PROHIBIDO hacer cartas cortas de menos de 300 palabras o de un solo párrafo.
   - ESTRUCTURA OBLIGATORIA (Exactamente 4 párrafos ÚNICOS y bien desarrollados, separados por \\n\\n, PROHIBIDO DUPLICAR O REPETIR PÁRRAFOS):
     1. Párrafo de apertura (4-5 oraciones): Empieza con una filosofía directiva y de pasión por el sector Retail y la Atención al Cliente (CX), conectando de inmediato tu liderazgo con la misión de gestionar y elevar la experiencia en tienda. PROHIBIDO saludos genéricos tipo "Estimado/a", "Me dirijo a usted" o "Tengo el agrado".
     2. Párrafo de trayectoria y gestión de tienda (5-6 oraciones): Describe tu experiencia liderando equipos de alto rendimiento, formando nuevos talentos, organizando operativamente la tienda y garantizando una experiencia de compra única. Explica cómo la transformación digital y las herramientas modernas han optimizado la rentabilidad y la fidelización sin mencionar nombres de empresas ni cargos previos fríos.
     3. Párrafo de análisis de KPIs y objetivos (5-6 oraciones): Conecta directamente con las responsabilidades clave del puesto solicitado: análisis continuo de KPIs para diseñar planes de acción comerciales, control visual, stock y rotación, y capacidad de ser un referente motivador e inspirador para el equipo de ventas.
     4. Párrafo de cierre (3-4 oraciones): Conclusión confiada y entusiasta, expresando tu motivación por aportar liderazgo estable y resultados a la organización en una entrevista personal.
   - TONO: Inspirador, humano, fresco, apasionado y con aplomo directivo en Retail y CX.
   - PROHIBICIONES ABSOLUTAS:
     • PROHIBIDO REPETIR O DUPLICAR PÁRRAFOS. Cada párrafo debe tratar un tema diferente.
     • NO menciones nombres de empresas (Telefónica, etc.) ni cargos previos.
     • NO incluyas firma ni datos de contacto al final (el sistema los renderiza dinámicamente).

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
    return JSON.parse(content);
  } catch (error) {
    console.error('Error llamando a DeepInfra:', error);
    throw new Error('Hubo un error al generar el CV. Por favor, intenta nuevamente.');
  }
};
