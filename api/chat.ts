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
    const aiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(aiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // If it fails, let's fetch the actual list of models they have access to so we can debug it
      const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const modelsData = await modelsRes.json();
      const modelNames = modelsData.models ? modelsData.models.map((m: any) => m.name).join(', ') : 'None';

      return res.status(500).json({ 
        error: 'API Error',
        message: `API Error: ${JSON.stringify(data.error || data)}. Available Models for your key: ${modelNames}`
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: `AI provider error: ${error.message || 'Unknown error'}`
    });
  }
}
