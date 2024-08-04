import type { NextApiRequest, NextApiResponse } from 'next';
import { put, del, list } from '@vercel/blob';

const API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const API_KEY = process.env.ELEVENLABS_API_KEY;
const VERCEL_BLOB_TOKEN = process.env.VERCEL_BLOB_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { voiceId, text } = req.body;

    if (!API_KEY || !VERCEL_BLOB_TOKEN) {
      return res.status(500).json({ message: 'Missing API key or Vercel blob token' });
    }

    try {
      const response = await fetch(`${API_URL}/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY,
          'Accept': 'audio/mpeg'
        } as HeadersInit,
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error('Error from API:', errorResponse);
        return res.status(response.status).json({ message: errorResponse });
      }

      const audioBlob = await response.blob();
      const buffer = Buffer.from(await audioBlob.arrayBuffer());

      const { blobs } = await list({ token: VERCEL_BLOB_TOKEN });
      if (blobs.length > 0) {
        await del(blobs.map(blob => blob.url), { token: VERCEL_BLOB_TOKEN });
      }

      const blobName = `audio-${Date.now()}.mp3`;

      const blobResponse = await put(blobName, buffer, {
        access: 'public',
        token: VERCEL_BLOB_TOKEN
      });

      res.status(200).json({ url: blobResponse.url });
    } catch (error) {
      console.error('Error in handler:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
