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

    const { title, eventType } = await request.json();

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
          content: `You are a scheduling expert. Based on the event title/type provided, suggest the optimal day of the week and time to hold this event. Consider:
          - Typical productivity patterns
          - Common availability for different event types
          - Best practices for different types of gatherings
          
          Respond in JSON format with these fields:
          {
            "suggestedDay": "Day of week",
            "suggestedTime": "HH:MM (24-hour format)",
            "reason": "Brief explanation (1-2 sentences)"
          }`,
        },
        {
          role: 'user',
          content: `Suggest the best time for: "${title}"${eventType ? ` (Type: ${eventType})` : ''}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    const suggestion = JSON.parse(content || '{}');

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error('AI Time Suggestion Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate time suggestion' },
      { status: 500 }
    );
  }
}
