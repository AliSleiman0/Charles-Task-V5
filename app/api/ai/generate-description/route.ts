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

    const { title } = await request.json();

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
          content: 'You are an expert event planner assistant. Generate a professional and engaging event description based on the event title provided. Keep it concise (2-3 sentences), informative, and inviting. Don\'t include any placeholders or brackets.',
        },
        {
          role: 'user',
          content: `Generate a description for an event titled: "${title}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const description = completion.choices[0]?.message?.content?.trim();

    return NextResponse.json({ description });
  } catch (error: any) {
    console.error('AI Description Error:', error);
    const message = error?.message || 'Failed to generate description';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
