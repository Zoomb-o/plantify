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

  // Debug: return everything we received
  return res.status(200).json({
    debug: true,
    method: req.method,
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    bodyType: typeof req.body,
    bodyKeys: req.body ? Object.keys(req.body) : [],
    hasImage: !!(req.body && req.body.image),
    imageLength: (req.body && req.body.image) ? req.body.image.length : 0,
    hasPrompt: !!(req.body && req.body.prompt),
    contentType: req.headers['content-type'],
    text: 'DEBUG MODE - not calling Gemini'
  });
}
