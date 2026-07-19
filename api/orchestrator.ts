import { z } from 'zod';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Input Validation Schema
const orchestratorSchema = z.object({
  message: z.string().min(1).max(500),
  type: z.string(),
  priority: z.string(),
  location: z.any()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Validate Input
  const result = orchestratorSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: (result as any).error?.errors });
  }

  const { message, type, priority, location } = result.data;
  let apiKey = process.env.GEMINI_API_KEY?.trim() || '';
  
  // Remove any accidental quotes the user might have pasted
  apiKey = apiKey.replace(/['"]/g, '');

  // 2. Check for API Key presence (Security Check for Demo Mode Fallback)
  if (!apiKey || apiKey === 'dummy_key') {
    return res.status(200).json({ 
      fallback: true,
      message: 'GEMINI_API_KEY is not configured on the server. Falling back to Demo Mode.' 
    });
  }

  const prompt = `You are the central AI Orchestrator for StadiumIQ, a smart stadium command center. 
Analyze the following incident report and return a JSON object with your assessment and recommendations.

Rules:
- Respond ONLY with valid JSON.
- The "severity" field must be exactly one of: "Critical", "High", "Medium", "Low".
- The "confidence" field must be an integer between 0 and 100.
- The "assignee" field should be the appropriate response team (e.g., "Medical Team", "Security", "Maintenance", "Team Alpha").
- The "recommendation" field must be a short, actionable sentence.

Incident Details:
- Report Message: ${message}
- Sensor Type: ${type}
- Sensor Priority: ${priority}
- Location Data: ${JSON.stringify(location)}

Example Output Structure:
{
  "severity": "High",
  "confidence": 94,
  "assignee": "Medical Team",
  "recommendation": "Dispatch Medical Team to location and clear immediate pathways."
}`;

  try {
    const aiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(aiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({ 
        fallback: true,
        message: `API Error: ${JSON.stringify(data.error || data)}`
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(200).json({ fallback: true, message: 'No response generated.' });
    }

    try {
      const jsonResponse = JSON.parse(text);
      return res.status(200).json(jsonResponse);
    } catch (parseError) {
      return res.status(200).json({ fallback: true, message: 'Failed to parse AI response as JSON', raw: text });
    }
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(200).json({ 
      fallback: true,
      message: `AI provider error: ${error.message || 'Unknown error'}`
    });
  }
}
