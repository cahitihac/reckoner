import { put } from '@vercel/blob';

const MAX_BYTES = 50 * 1024; // 50 KB

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  // Validate required fields
  if (
    typeof body.eventName !== 'string' ||
    typeof body.currency !== 'string' ||
    !Array.isArray(body.participants) ||
    !Array.isArray(body.expenses)
  ) {
    return res.status(400).json({ error: 'Invalid payload structure' });
  }

  // Sanitize — only keep known fields with bounded lengths
  const data = {
    eventName: body.eventName.slice(0, 200),
    currency: body.currency.slice(0, 10),
    participants: body.participants.slice(0, 200).map(p => ({
      id: String(p.id ?? '').slice(0, 50),
      name: String(p.name ?? '').slice(0, 200),
    })),
    expenses: body.expenses.slice(0, 1000).map(e => ({
      id: String(e.id ?? '').slice(0, 50),
      description: String(e.description ?? '').slice(0, 500),
      amount: Number(e.amount) || 0,
      payerId: String(e.payerId ?? '').slice(0, 50),
      participantIds: Array.isArray(e.participantIds)
        ? e.participantIds.slice(0, 200).map(id => String(id).slice(0, 50))
        : [],
    })),
  };

  const json = JSON.stringify(data);
  if (Buffer.byteLength(json, 'utf8') > MAX_BYTES) {
    return res.status(413).json({ error: 'Payload too large' });
  }

  try {
    const id = crypto.randomUUID();
    await put(`shares/${id}.json`, json, {
      access: 'public',
      contentType: 'application/json',
    });
    return res.status(200).json({ id });
  } catch (err) {
    console.error('share POST error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
