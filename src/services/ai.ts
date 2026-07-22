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
1. Analiza los requerimientos de la oferta laboral.
2. Reescribe el "summary", las descripciones de la "experience" y selecciona las "skills" más relevantes del CV BASE para que hagan un match perfecto con la oferta laboral. No inventes experiencia que el candidato no tiene, solo resalta y adapta lo que ya está en el CV BASE.
3. Redacta una carta de presentación ejecutiva, persuasiva y profesional, dirigida a los reclutadores de esta oferta, utilizando los datos del CV BASE.

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
