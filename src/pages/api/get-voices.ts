import type { NextApiRequest, NextApiResponse } from 'next';

const API_URL = 'https://api.elevenlabs.io/v1/voices';
const API_KEY = process.env.ELEVENLABS_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (!API_KEY) {
      return res.status(500).json({ message: 'Missing ELEVENLABS_API_KEY' });
    }

    try {
      console.log(API_KEY);

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'xi-api-key': API_KEY,
        } as HeadersInit,
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error('Error from API:', errorResponse);
        return res.status(response.status).json({ message: errorResponse });
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error in handler:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
