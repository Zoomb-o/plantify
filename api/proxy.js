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
          { inline_data: { mime_type: 'image/jpeg', data: image } },
          { text: prompt }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody)
      }
    );

    const raw = await response.text();

    let data;
    try {
      data = JSON.parse(raw);
    } catch(e) {
      return res.status(500).json({ error: 'Invalid response from Gemini: ' + raw.slice(0, 200) });
    }

    if (!response.ok) {
      const msg = data?.error?.message || `Gemini error ${response.status}`;
      return res.status(response.status).json({ error: msg });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(500).json({ error: 'Empty response from Gemini. Raw: ' + raw.slice(0, 300) });
    }

    res.status(200).json({ text });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}