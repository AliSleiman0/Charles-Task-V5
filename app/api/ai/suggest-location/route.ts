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

    const { title, description } = await request.json();

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
          content: `You are an event venue expert. Based on the event title and description, suggest appropriate venue types or location ideas. Provide 3 suggestions ranging from casual to more formal options.

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{"suggestions": [{"type": "Venue type", "description": "Brief explanation"}, {"type": "Venue type 2", "description": "Brief explanation"}, {"type": "Venue type 3", "description": "Brief explanation"}]}`,
        },
        {
          role: 'user',
          content: `Suggest locations for: "${title}"${description ? `\nDescription: ${description}` : ''}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content?.trim() || '{"suggestions":[]}';
    
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
