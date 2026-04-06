import { list } from '@vercel/blob';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || !UUID_RE.test(id)) {
    return res.status(400).json({ error: 'Invalid share ID' });
  }

  try {
    const { blobs } = await list({ prefix: `shares/${id}.json`, limit: 1 });
    if (blobs.length === 0) {
      return res.status(404).json({ error: 'Share not found' });
    }

    const upstream = await fetch(blobs[0].url);
    if (!upstream.ok) {
      return res.status(502).json({ error: 'Failed to fetch shared data' });
    }

    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('share GET error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
