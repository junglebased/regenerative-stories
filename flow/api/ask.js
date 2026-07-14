import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const { question, nodeIndex } = req.body || {};
  if (!question || typeof question !== 'string') {
    res.status(400).json({ error: 'question_required' });
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'server_not_configured' });
    return;
  }

  const idx = typeof nodeIndex === 'string' ? nodeIndex.slice(0, 20000) : '';
  const system = `Sen "Flow" — Regenerative Stories & second brain bilgi grafiğisin. Aşağıda node listesi var (id|başlık|tip|bölge). Soruya en alakalı 3-6 node seç. SADECE şu JSON ile cevap ver, başka hiçbir şey yazma:\n{"path":["id1","id2"],"answer":"Türkçe 2-3 cümle"}\n\n${idx}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: question }],
    });

    const block = message.content.find((b) => b.type === 'text');
    let raw = block ? block.text : '{}';
    raw = raw.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { answer: raw, path: [] };
    }

    res.status(200).json({
      answer: parsed.answer || '',
      path: Array.isArray(parsed.path) ? parsed.path : [],
    });
  } catch (err) {
    res.status(502).json({ error: 'llm_error', detail: String((err && err.message) || err) });
  }
}
