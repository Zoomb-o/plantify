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

  const apiKey = req.headers['x-api-key'];
  const { image, prompt } = req.body || {};

  if (!apiKey || !image) {
    return res.status(200).json({ text: '{"sceneDescription":"Debug: apiKey=' + (!!apiKey) + ' imageLen=' + (image ? image.length : 0) + '","plants":[]}' });
  }

  const geminiRes = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { inline_data: { mime_type: 'image/jpeg', data: image } },
          { text: prompt || 'What plants are in this image? Reply with JSON: {"sceneDescription":"desc","plants":[]}' }
        ]}],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
      })
    }
  );

  const raw = await geminiRes.text();
  
  if (!geminiRes.ok) {
    return res.status(200).json({ text: '{"sceneDescription":"Gemini error ' + geminiRes.status + ': ' + raw.slice(0,200).replace(/"/g,"'") + '","plants":[]}' });
  }

  let data;
  try { data = JSON.parse(raw); } catch(e) { return res.status(200).json({ text: '{"sceneDescription":"Parse error: ' + raw.slice(0,100) + '","plants":[]}' }); }

  const text = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
  if (!text) return res.status(200).json({ text: '{"sceneDescription":"No text: ' + raw.slice(0,200).replace(/"/g,"'") + '","plants":[]}' });

  return res.status(200).json({ text: text });
}