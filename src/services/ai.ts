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
   - Debes ADECUAR Y REESCRIBIR TODO EL CONTENIDO del CV BASE al puesto al que postula.
   - OBLIGATORIO: Debes INCLUIR TODAS las experiencias laborales del CV Base, no recortes la lista. Sin embargo, debes REESCRIBIR profunda y extensamente el "summary" (Acerca de mi) y cada viñeta de cada experiencia integrando naturalmente las palabras clave de la oferta.
   - SELECCIÓN DE PORTAFOLIO (CASOS DE USO): Selecciona ÚNICAMENTE 3 a 5 casos. OBLIGATORIO: NO INVENTES números, métricas o resultados que no existan en la descripción original del portafolio. Re-enfoca la descripción estrictamente con los hechos reales, pero enfocándolo como "Casos de Aplicación Práctica" o "Implementaciones de Conocimiento" en lugar de proyectos personales.
   - TÍTULO DE PORTAFOLIO ADAPTADO: Renombra la sección del portafolio (portfolioTitle) para que haga sentido con el puesto y oculte la palabra "proyecto". Por ejemplo: "Aplicación Práctica de Tecnologías", "Optimización y Automatización de Procesos", etc.
   - DOMINIOS TÉCNICOS Y OPERATIVOS: Filtra y selecciona los dominios que hagan match con la vacante. Puedes renombrar los títulos de los dominios (ej. de "Desarrollo Comercial" a "Estrategia B2B") y selecciona solo las skills internas más relevantes de cada dominio.
   - CERTIFICACIONES: El CV base tiene muchísimas certificaciones. Selecciona ÚNICAMENTE las 6 a 8 certificaciones más críticas y relevantes para la oferta.
   - NO INVENTES NADA NUEVO. Re-enfoca lo que ya existe. Si la oferta pide "gestión ágil", reescribe sus logros pasados resaltando cómo aplicó agilidad.
   - El CV resultante DEBE SER EXTENSO y detallado (al menos la misma cantidad de viñetas originales por cada cargo), manteniendo OBLIGATORIAMENTE todas las cifras de impacto (20M de clientes, ahorros, certificaciones).
   - Selecciona y destaca solo las "skills" más relevantes que conecten su experiencia real con la oferta.
3. REGLAS DE ORO PARA EL TONO Y ESTILO:
   - Usa un lenguaje HUMANO pero ALTAMENTE PERSUASIVO Y PROFESIONAL. No uses un lenguaje demasiado básico o informal; debes sonar como un experto maduro y seguro de sí mismo.
   - EQUILIBRIO PERFECTO: No asustes al reclutador pareciendo "demasiado caro o inalcanzable", pero DEMUESTRA sin lugar a dudas que eres el mejor candidato. Enfatiza que tienes el bagaje táctico y estratégico, y que estás dispuesto a involucrarte al 100% en la operación diaria ("hands-on").
   - NO FUERCES TEMAS DE INTELIGENCIA ARTIFICIAL si la oferta no los pide explícitamente. Si la oferta es puramente operativa, de ventas o de gestión clásica, enfoca el currículum y la carta ÚNICAMENTE en su enorme experiencia operativa, liderazgo y logros en Telecomunicaciones. Habla de IA solo si suma valor directo al dolor de la empresa.
   - No inventes experiencia. Todo debe salir del CV BASE.
4. Redacta una CARTA DE PRESENTACIÓN densa, elocuente y altamente detallada.
   - PROHIBIDO HACER CARTAS CORTAS O SIMPLES. La carta debe tener al menos 4 párrafos extensos y robustos, con una retórica ejecutiva, profunda y persuasiva.
   - Usa la "baseCoverLetter" del CV BASE como tu columna vertebral de narrativa, historia y tono, pero ADÁPTALA MILIMÉTRICAMENTE a las necesidades exactas del puesto. Si el puesto no requiere tecnología, elimina referencias a "Motores de IA" y reemplázalas por "Estrategias de Eficiencia", pero mantén el volumen, la profundidad y el peso de la carta original.
   - Empieza con un gancho corporativo fuerte. Desarrolla extensamente en los párrafos centrales cómo tu experiencia operativa y directiva (citando métricas y logros específicos del CV) se alinea a la perfección para resolver los "puntos de dolor" de la empresa. Cierra con un llamado a la acción rotundo.

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
