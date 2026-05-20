/**
 * Vercel Serverless Function: Image Proxy
 * Fetches HTTP images server-side to avoid mixed content blocking on HTTPS pages.
 *
 * Usage: /api/img-proxy?url=http://example.com/image.png
 */
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing "url" query parameter' });
  }

  // Only allow proxying image URLs (basic validation)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return res.status(400).json({ error: 'Invalid URL scheme, must be http or https' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ImageStudio-Proxy/1.0',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Upstream returned ${response.status}` });
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(buffer);
  } catch (err) {
    return res.status(502).json({ error: 'Failed to fetch image', detail: err.message });
  }
}
