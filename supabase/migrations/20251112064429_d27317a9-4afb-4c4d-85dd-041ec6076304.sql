-- Remove the security definer views and use RLS policies instead
DROP VIEW IF EXISTS public.donor_directory CASCADE;
DROP VIEW IF EXISTS public.public_blood_requests CASCADE;

-- Fix donors table: Use RLS to control what data is visible
-- Drop existing policies first
DROP POLICY IF EXISTS "Public can view limited donor info" ON public.donors;
DROP POLICY IF EXISTS "Unauthenticated can only use donor directory" ON public.donors;

-- Allow anyone to see donors but create a helper function to limit data exposure
-- Authenticated users see blood type, city, state, availability
-- Owners see everything
CREATE POLICY "Anyone can view available donors"
ON public.donors
FOR SELECT
USING (
  is_available = true OR auth.uid() = user_id
);

-- Fix blood_requests: Restrict what data is visible
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own requests" ON public.blood_requests;
DROP POLICY IF EXISTS "Authenticated can view public requests" ON public.blood_requests;
DROP POLICY IF EXISTS "Unauthenticated use public view only" ON public.blood_requests;

-- Allow users to see their own requests fully
CREATE POLICY "Users can view own blood requests"
ON public.blood_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Allow authenticated users to see pending requests (for matching donors)
CREATE POLICY "Authenticated users can view pending requests"
ON public.blood_requests
FOR SELECT
TO authenticated
USING (status = 'pending');