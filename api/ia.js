export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API error response:', response.status, data);
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    if (!Array.isArray(data.content)) {
      console.error('Unexpected response structure:', data);
      return res.status(500).json({ error: 'Unexpected API response' });
    }

    const text = data.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    return res.status(200).json({ text });
  } catch (e) {
    console.error('IA API error:', e.message, e.stack);
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
};
