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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const prompt = `You are an expert event planner assistant. Generate a professional and engaging event description based on the event title provided. Keep it concise (2-3 sentences), informative, and inviting. Don't include any placeholders or brackets.

Generate a description for an event titled: "${title}"`;

    const result = await model.generateContent(prompt);
    const description = result.response.text().trim();

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
