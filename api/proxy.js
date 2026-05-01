export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing API key' });

  try {
    const { image, prompt } = req.body;

    if (!image) return res.status(400).json({ error: 'No image in request body' });
    if (!prompt) return res.status(400).json({ error: 'No prompt in request body' });

    const b64clean = image.replace(/\s/g, '');
    if (b64clean.length < 100) {
      return res.status(400).json({ error: 'Image too short: ' + b64clean.length + ' chars' });
    }

    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: 'image/jpeg', data: b64clean } },
            { text: prompt }
          ]}],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
        })
      }
    );

    const raw = await geminiRes.text();
    let data;
    try { data = JSON.parse(raw); }
    catch(e) { return res.status(500).json({ error: 'Gemini non-JSON: ' + raw.slice(0, 300) }); }

    if (!geminiRes.ok) {
      const msg = data && data.error && data.error.message ? data.error.message : raw.slice(0, 300);
      return res.status(geminiRes.status).json({ error: 'Gemini ' + geminiRes.status + ': ' + msg });
    }

    const text = data && data.candidates && data.candidates[0] &&
                 data.candidates[0].content && data.candidates[0].content.parts &&
                 data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;

    if (!text) {
      return res.status(500).json({ error: 'No text from Gemini: ' + raw.slice(0, 300) });
    }

    return res.status(200).json({ text: text });

  } catch(err) {
    return res.status(500).json({ error: 'Proxy error: ' + err.message });
  }
}
