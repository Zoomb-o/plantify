// api/proxy.js — Gemini proxy for Plantify
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing API key' });

  try {
    const { image, prompt } = req.body;

    const geminiBody = {
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: image
            }
          },
          {
            text: prompt
          }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'Gemini API error' });
    }

    // Extract text from Gemini response format
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{"plants":[]}';
    res.status(200).json({ text });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
