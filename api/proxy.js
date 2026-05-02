export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GEMINI_API_KEY;
  const image = req.body && req.body.image ? req.body.image : '';

  if (!apiKey || !image) {
    return res.status(200).json({ text: JSON.stringify({
      sceneDescription: 'Debug: key=' + (!!apiKey) + ' imgLen=' + image.length,
      plants: []
    })});
  }

  try {
    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: 'image/jpeg', data: image } },
            { text: 'You are a botanist. Identify all plants in this image. You MUST respond with ONLY a valid JSON object, no markdown, no explanation, no code fences. Use this exact structure: {"sceneDescription":"describe the scene","plants":[{"number":1,"common":"Common Name","scientific":"Scientific Name","type":"flower","description":"One sentence.","details":"Two sentences.","edible":"unknown","confidence":"high","x":50,"y":50}]}. If no plants found use empty array.' }
          ]}],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
        })
      }
    );

    const raw = await geminiRes.text();
    let geminiData;
    try { geminiData = JSON.parse(raw); } 
    catch(e) { return res.status(200).json({ text: JSON.stringify({ sceneDescription: 'Gemini parse error: ' + raw.slice(0,100), plants: [] }) }); }

    if (!geminiRes.ok) {
      const msg = geminiData && geminiData.error ? geminiData.error.message : raw.slice(0,100);
      return res.status(200).json({ text: JSON.stringify({ sceneDescription: 'Gemini error: ' + msg, plants: [] }) });
    }

    const responseText = geminiData && geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content && geminiData.candidates[0].content.parts && geminiData.candidates[0].content.parts[0] && geminiData.candidates[0].content.parts[0].text;

    if (!responseText) {
      return res.status(200).json({ text: JSON.stringify({ sceneDescription: 'No text returned from Gemini', plants: [] }) });
    }

    // Clean and parse Gemini's response
    const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start === -1) {
      return res.status(200).json({ text: JSON.stringify({ sceneDescription: 'Gemini said: ' + responseText.slice(0,150), plants: [] }) });
    }

    let result;
    try {
      result = JSON.parse(cleaned.slice(start, end + 1));
    } catch(e) {
      return res.status(200).json({ text: JSON.stringify({ sceneDescription: 'JSON parse failed: ' + cleaned.slice(0,100), plants: [] }) });
    }

    // Return clean JSON string
    return res.status(200).json({ text: JSON.stringify(result) });

  } catch(err) {
    return res.status(200).json({ text: JSON.stringify({ sceneDescription: 'Error: ' + err.message, plants: [] }) });
  }
}
