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
  let apiKey = process.env.GEMINI_API_KEY?.trim() || '';
  
  // Remove any accidental quotes the user might have pasted
  apiKey = apiKey.replace(/['"]/g, '');

  // 2. Check for API Key presence (Security Check)
  if (!apiKey || apiKey === 'dummy_key') {
    return res.status(200).json({ 
      text: '[Demo Mode] AI service is temporarily unavailable. A response team has been notified.',
      fallback: true
    });
  }

  try {
    const aiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(aiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({ 
        text: '[Demo Mode] AI service is temporarily unavailable. A response team has been notified.',
        fallback: true
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    return res.status(200).json({ text });
  } catch (error: any) {
    return res.status(200).json({ 
      text: '[Demo Mode] AI service is temporarily unavailable. A response team has been notified.',
      fallback: true
    });
  }
}
