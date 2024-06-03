import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const response = await axios.get('http://localhost:8000/latest_submitted_code');
      res.status(200).json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || 'An error occurred');
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
