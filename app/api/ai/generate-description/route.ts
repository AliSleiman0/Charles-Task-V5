import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert event planner assistant. Generate a professional and engaging event description based on the event title provided. Keep it concise (2-3 sentences), informative, and inviting. Don't include any placeholders or brackets.`,
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
  } catch (error) {
    console.error('AI Description Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
}
