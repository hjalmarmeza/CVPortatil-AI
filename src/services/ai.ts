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
   - Debes ADECUAR TODO EL CONTENIDO del CV BASE al puesto al que postula. 
   - NO INVENTES NADA NUEVO, pero RE-ENFOCA, RE-REDACTA y ADAPTA cada logro, viñeta y experiencia para que encaje perfectamente con lo que busca la empresa. Si la oferta pide "gestión ágil", enfoca sus logros pasados en cómo aplicó agilidad. 
   - El CV resultante no debe ser simple. Debe mantener el mismo nivel de profundidad, impacto y detalle (conservando cifras como 20M de clientes, ahorros, etc.), pero toda la narrativa debe sentirse hecha a medida para la vacante.
   - Selecciona y destaca solo las "skills" más relevantes que conecten su experiencia real con la oferta.
3. REGLAS DE ORO PARA EL TONO Y ESTILO:
   - Usa un lenguaje HUMANO pero ALTAMENTE PERSUASIVO Y PROFESIONAL. No uses un lenguaje demasiado básico o informal; debes sonar como un experto maduro y seguro de sí mismo.
   - EQUILIBRIO PERFECTO: No asustes al reclutador pareciendo "demasiado caro o inalcanzable", pero DEMUESTRA sin lugar a dudas que eres el mejor candidato. Enfatiza que tienes el bagaje táctico y estratégico, y que estás dispuesto a involucrarte al 100% en la operación diaria ("hands-on").
   - NO FUERCES TEMAS DE INTELIGENCIA ARTIFICIAL si la oferta no los pide explícitamente. Si la oferta es puramente operativa, de ventas o de gestión clásica, enfoca el currículum y la carta ÚNICAMENTE en su enorme experiencia operativa, liderazgo y logros en Telecomunicaciones. Habla de IA solo si suma valor directo al dolor de la empresa.
   - No inventes experiencia. Todo debe salir del CV BASE.
4. Redacta una CARTA DE PRESENTACIÓN impactante. 
   - RE-ENFOCA Y ADAPTA la carta hacia las necesidades exactas del puesto al que postula. Usa la "baseCoverLetter" del CV BASE como referencia de tono e historia, pero ADÁPTALA. Si el puesto no requiere tecnología avanzada, elimina de la carta las referencias a "Motores de IA" y enfócate en sus habilidades de liderazgo masivo y eficiencia.
   - No hagas una carta genérica ni corta. Debe tener al menos 3 a 4 párrafos bien estructurados.
   - Empieza con gancho, explica cómo tu experiencia (mencionando métricas del CV base) resuelve exactamente lo que la oferta pide, y cierra con un llamado a la acción seguro y humilde.

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
        "description": ["...", "..."]
      }
    ],
    "skills": ["...", "..."]
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
