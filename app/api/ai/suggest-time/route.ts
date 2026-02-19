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

    const { title, eventType } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const prompt = `You are a scheduling expert. Based on the event title/type provided, suggest the optimal day of the week and time to hold this event. Consider:
- Typical productivity patterns
- Common availability for different event types
- Best practices for different types of gatherings

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{"suggestedDay": "Day of week", "suggestedTime": "HH:MM", "reason": "Brief explanation (1-2 sentences)"}

Event: "${title}"${eventType ? ` (Type: ${eventType})` : ''}`;

    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();
    
    // Clean up potential markdown formatting
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const suggestion = JSON.parse(cleanedContent);

    return NextResponse.json(suggestion);
  } catch (error: any) {
    console.error('AI Time Suggestion Error:', error);
    const message = error?.message || 'Failed to generate time suggestion';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
