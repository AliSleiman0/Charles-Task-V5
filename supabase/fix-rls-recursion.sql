-- Fix RLS infinite recursion by using SECURITY DEFINER functions
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own events" ON public.events;
DROP POLICY IF EXISTS "Users can create own events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;

DROP POLICY IF EXISTS "Event owners can view participants" ON public.event_participants;
DROP POLICY IF EXISTS "Event owners can add participants" ON public.event_participants;
DROP POLICY IF EXISTS "Event owners can update participants" ON public.event_participants;
DROP POLICY IF EXISTS "Event owners can delete participants" ON public.event_participants;

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

-- Recreate events policies (no direct subqueries to event_participants)
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

-- Recreate event_participants policies (no direct subqueries to events)
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
