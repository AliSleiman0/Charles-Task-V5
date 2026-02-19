import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

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

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get events for the next 7 days
    const startOfWeek = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const { data: events } = await supabase
      .from('events')
      .select('title, event_datetime, location, status')
      .eq('user_id', user.id)
      .gte('event_datetime', startOfWeek.toISOString())
      .lte('event_datetime', endOfWeek.toISOString())
      .order('event_datetime', { ascending: true });

    if (!events || events.length === 0) {
      return NextResponse.json({
        summary: "You have no events scheduled for the upcoming week. It's a great time to plan new activities or enjoy some free time!",
      });
    }

    const eventList = events.map(e => 
      `- ${e.title} on ${new Date(e.event_datetime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}${e.location ? ` at ${e.location}` : ''} (${e.status})`
    ).join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that provides concise, friendly weekly schedule summaries. Summarize the user's upcoming week in 2-3 sentences. Highlight any busy days and provide a brief overview of key events. Keep it encouraging and helpful.`,
        },
        {
          role: 'user',
          content: `Here are my events for the upcoming week:\n${eventList}\n\nPlease provide a brief summary of my week.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    return NextResponse.json({ summary, events });
  } catch (error: any) {
    console.error('AI Weekly Summary Error:', error);
    const message = error?.error?.message || error?.message || 'Failed to generate weekly summary';
    const status = error?.status || 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
