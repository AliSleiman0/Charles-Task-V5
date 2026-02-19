-- Event Scheduler Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('upcoming', 'attending', 'maybe', 'declined')) DEFAULT 'upcoming',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_participants table
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  response_status TEXT CHECK (response_status IN ('attending', 'maybe', 'declined', 'pending')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, email)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_datetime ON public.events(event_datetime);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON public.event_participants(email);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Helper function to check if user is event owner (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_event_owner(event_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is participant of an event (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_event_participant(event_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email FROM public.profiles WHERE id = auth.uid();
  RETURN EXISTS (
    SELECT 1 FROM public.event_participants 
    WHERE event_id = event_uuid 
    AND (user_id = auth.uid() OR email = user_email)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Events policies
CREATE POLICY "Users can view own events"
  ON public.events FOR SELECT
  USING (
    user_id = auth.uid() OR 
    is_public = true OR
    public.is_event_participant(id)
  );

CREATE POLICY "Users can create own events"
  ON public.events FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own events"
  ON public.events FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own events"
  ON public.events FOR DELETE
  USING (user_id = auth.uid());

-- Event participants policies
CREATE POLICY "Event owners can view participants"
  ON public.event_participants FOR SELECT
  USING (
    public.is_event_owner(event_id) OR
    user_id = auth.uid() OR
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Event owners can add participants"
  ON public.event_participants FOR INSERT
  WITH CHECK (
    public.is_event_owner(event_id)
  );

CREATE POLICY "Event owners can update participants"
  ON public.event_participants FOR UPDATE
  USING (
    public.is_event_owner(event_id) OR
    user_id = auth.uid() OR
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Event owners can delete participants"
  ON public.event_participants FOR DELETE
  USING (
    public.is_event_owner(event_id)
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to link participant to user when they sign up
CREATE OR REPLACE FUNCTION public.link_participant_to_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.event_participants
  SET user_id = new.id
  WHERE email = new.email AND user_id IS NULL;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to link participants when user signs up
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.link_participant_to_user();
