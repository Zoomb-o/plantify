export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing API key' });

  try {
    const body = req.body;
    
    // Debug: log what we received
    if (!body) return res.status(400).json({ error: 'No body received' });
    if (!body.image) return res.status(400).json({ error: 'No image in body' });
    if (!body.prompt) return res.status(400).json({ error: 'No prompt in body' });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: 'image/jpeg', data: body.image } },
              { text: body.prompt }
            ]
          }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
        })
      }
    );

    const raw = await response.text();
    console.log('Gemini status:', response.status);
    console.log('Gemini raw:', raw.slice(0, 500));

    let data;
    try { data = JSON.parse(raw); } 
    catch(e) { return res.status(500).json({ error: 'JSON parse failed. Raw: ' + raw.slice(0, 300) }); }

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data?.error?.message || 'Gemini error ' + response.status 
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(500).json({ 
        error: 'No text in response. Keys: ' + Object.keys(data).join(', ') + ' | Raw: ' + raw.slice(0, 300)
      });
    }

    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: 'Caught: ' + err.message + ' | ' + err.stack?.slice(0,200) });
  }
}