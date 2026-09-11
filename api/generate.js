export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.VITE_DEEPINFRA_API_KEY; // Vercel env vars are available in process.env
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured on server' });
  }

  try {
    const { prompt, model, temperature, max_tokens } = req.body;

    const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'meta-llama/Meta-Llama-3.1-70B-Instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature || 0.2,
        max_tokens: max_tokens || 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `DeepInfra Error: ${errorText}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Server error proxying to DeepInfra:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
