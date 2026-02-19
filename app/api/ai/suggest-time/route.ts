import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const { title, eventType } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a scheduling expert. Based on the event title/type provided, suggest the optimal day of the week and time to hold this event. Consider:
- Typical productivity patterns
- Common availability for different event types
- Best practices for different types of gatherings

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{"suggestedDay": "Day of week", "suggestedTime": "HH:MM", "reason": "Brief explanation (1-2 sentences)"}`,
        },
        {
          role: 'user',
          content: `Suggest the best time for: "${title}"${eventType ? ` (Type: ${eventType})` : ''}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = completion.choices[0]?.message?.content?.trim() || '{}';
    
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
