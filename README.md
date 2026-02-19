
# Event Scheduler Application

A modern, production-ready event scheduling application built with Next.js, Supabase, and OpenAI. Features intelligent AI-powered event management, invitations system, and a beautiful responsive UI.

![Event Scheduler](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Event+Scheduler)

## Features

### Core Features
- **Authentication**: Secure email/password authentication via Supabase
- **Event Management**: Full CRUD operations for events
- **Status Tracking**: Color-coded status badges (Upcoming, Attending, Maybe, Declined)
- **Search & Filtering**: Server-side filtering by title, date range, location, and status
- **Invitation System**: Invite participants via email, track responses
- **Public Profiles**: Shareable read-only view of public events

### AI-Powered Features
1. **Smart Description Generator**: Enter a title and let AI craft a polished event description
2. **Best Time Suggestion**: Get AI recommendations for optimal event timing based on event type
3. **Weekly Summary**: AI-generated overview of your upcoming week
4. **Location Suggestions**: Smart venue recommendations based on event type (Bonus)

### UI/UX
- Clean dashboard with stats cards
- Responsive sidebar navigation
- Loading states and empty states
- Toast notifications
- Modern minimalist design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **AI Integration**: OpenAI API (GPT-3.5-turbo)
- **Deployment**: Vercel

## Project Structure

```
event-scheduler/
├── app/
│   ├── (dashboard)/           # Protected routes with sidebar
│   │   ├── dashboard/         # Main dashboard
│   │   ├── events/            # Events CRUD pages
│   │   └── invitations/       # Invitations page
│   ├── api/
│   │   └── ai/                # AI API routes
│   │       ├── generate-description/
│   │       ├── suggest-time/
│   │       ├── suggest-location/
│   │       └── weekly-summary/
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── profile/[userId]/      # Public profile
│   └── actions/               # Server actions
│       ├── auth.ts
│       ├── events.ts
│       └── invitations.ts
├── components/                # Reusable UI components
│   ├── EventCard.tsx
│   ├── EventForm.tsx
│   ├── EventFilters.tsx
│   ├── InvitationCard.tsx
│   ├── ParticipantsList.tsx
│   ├── Sidebar.tsx
│   ├── StatsCard.tsx
│   ├── WeeklySummary.tsx
│   ├── EmptyState.tsx
│   └── Loading.tsx
├── lib/
│   ├── supabase/              # Supabase clients
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils.ts               # Utility functions
├── types/
│   └── database.ts            # TypeScript types
├── supabase/
│   └── schema.sql             # Database schema & RLS
└── middleware.ts              # Route protection
```

## Local Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-scheduler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API

### 2. Run the Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/schema.sql`
3. Run the SQL script

This will create:
- `profiles` table (user profiles)
- `events` table (events with all required fields)
- `event_participants` table (invitations)
- Row Level Security policies
- Indexes for performance
- Triggers for auto-profile creation

### 3. Enable Email Auth

1. Go to Authentication > Providers
2. Ensure Email provider is enabled
3. (Optional) Disable email confirmation for testing:
   - Go to Authentication > Settings
   - Disable "Enable email confirmations"

### 4. Database Schema Overview

```sql
-- Events Table
events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_datetime TIMESTAMP WITH TIME ZONE,
  status TEXT ('upcoming' | 'attending' | 'maybe' | 'declined'),
  is_public BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
)

-- Event Participants Table
event_participants (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  user_id UUID REFERENCES profiles(id),
  email TEXT NOT NULL,
  response_status TEXT ('attending' | 'maybe' | 'declined' | 'pending'),
  created_at TIMESTAMP WITH TIME ZONE
)
```

## Deployment to Vercel

### Step-by-Step Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `OPENAI_API_KEY`
     - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
   - Click "Deploy"

3. **Update Supabase Settings**
   - Add your Vercel URL to Supabase Auth settings:
     - Go to Authentication > URL Configuration
     - Add your production URL to Site URL
     - Add redirect URLs as needed

### Production URL Format
```
https://your-app-name.vercel.app
```

## Testing Invitations

1. **Create two test accounts**
   - Register user A (sender)
   - Register user B (recipient)

2. **Send an invitation**
   - Login as user A
   - Create an event
   - Go to event details
   - Enter user B's email and click "Invite"

3. **Respond to invitation**
   - Login as user B
   - Go to "Invitations" page
   - Click "Attending", "Maybe", or "Decline"

4. **Verify response**
   - Login as user A
   - Go to event details
   - Check participant list for updated status

## AI Features Usage

### Generate Description
1. Enter an event title
2. Click "Generate with AI" button
3. AI will create a professional description

### Suggest Best Time
1. Enter an event title
2. Click "Suggest best time"
3. View AI recommendation with reasoning

### Weekly Summary
1. Go to Dashboard
2. Click "Generate" on the AI Weekly Summary card
3. View AI-generated overview of your week

### Location Suggestions
1. Enter event title and optional description
2. Click "Suggest locations"
3. Click any suggestion to use it

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Protected Routes**: Dashboard requires authentication
- **Server-side Validation**: All inputs validated server-side
- **Secure API Routes**: AI endpoints protected
- **CSRF Protection**: Built-in Next.js protection

## Future Improvements

- [ ] Calendar view for events
- [ ] Email notifications for invitations
- [ ] Recurring events
- [ ] Google Calendar integration
- [ ] Event reminders
- [ ] Team/organization support
- [ ] Event categories/tags
- [ ] Dark mode
- [ ] Export events to ICS

## Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `NEXT_PUBLIC_APP_URL` | Your application URL |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

MIT License - feel free to use this project for your own purposes.

---

Built with Next.js, Supabase, and OpenAI
