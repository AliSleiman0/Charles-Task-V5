import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';

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

    const prompt = `You are a helpful assistant that provides concise, friendly weekly schedule summaries. Summarize the user's upcoming week in 2-3 sentences. Highlight any busy days and provide a brief overview of key events. Keep it encouraging and helpful.

Here are my events for the upcoming week:
${eventList}

Please provide a brief summary of my week.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    return NextResponse.json({ summary, events });
  } catch (error: any) {
    console.error('AI Weekly Summary Error:', error);
    const message = error?.message || 'Failed to generate weekly summary';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
