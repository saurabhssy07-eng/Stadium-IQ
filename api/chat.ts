import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Input Validation Schema
const chatSchema = z.object({
  message: z.string().min(1).max(500),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Validate Input
  const result = chatSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: (result as any).error?.errors });
  }

  const { message } = result.data;
  const apiKey = process.env.GEMINI_API_KEY;

  // 2. Check for API Key presence (Security Check)
  if (!apiKey || apiKey === 'dummy_key') {
    return res.status(503).json({ 
      error: 'Service Unavailable', 
      message: 'GEMINI_API_KEY is not configured on the server. Falling back to Demo Mode.' 
    });
  }

  try {
    // 3. Initialize AI securely on the server
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 4. Generate Content
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const response = await model.generateContent(message);
    
    return res.status(200).json({ text: response.response.text() });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: `AI provider error: ${error.message || 'Unknown error'}`
    });
  }
}
