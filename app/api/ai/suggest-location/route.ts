import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const prompt = `You are an event venue expert. Based on the event title and description, suggest appropriate venue types or location ideas. Provide 3 suggestions ranging from casual to more formal options.

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{"suggestions": [{"type": "Venue type", "description": "Brief explanation"}, {"type": "Venue type 2", "description": "Brief explanation"}, {"type": "Venue type 3", "description": "Brief explanation"}]}

Event: "${title}"${description ? `\nDescription: ${description}` : ''}`;

    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();
    
    // Clean up potential markdown formatting
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedContent);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('AI Location Suggestion Error:', error);
    const message = error?.message || 'Failed to generate location suggestions';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
