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

    const { title, description } = await request.json();

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
          content: `You are an event venue expert. Based on the event title and description, suggest appropriate venue types or location ideas. Provide 3 suggestions ranging from casual to more formal options.
          
          Respond in JSON format:
          {
            "suggestions": [
              { "type": "Venue type", "description": "Brief explanation" }
            ]
          }`,
        },
        {
          role: 'user',
          content: `Suggest locations for: "${title}"${description ? `\nDescription: ${description}` : ''}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    const result = JSON.parse(content || '{"suggestions":[]}');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Location Suggestion Error:', error);
    const message = error?.error?.message || error?.message || 'Failed to generate location suggestions';
    const status = error?.status || 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
