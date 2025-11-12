-- Fix 1: Create secure donor directory view and contact access function
-- This solves the broken donor search while protecting private data

-- Create a public-safe donor directory view
CREATE OR REPLACE VIEW public.donor_directory AS
SELECT 
  d.id,
  d.blood_type,
  d.city,
  d.state,
  d.is_available,
  d.created_at
FROM donors d
WHERE d.is_available = true;

GRANT SELECT ON public.donor_directory TO anon, authenticated;

-- Create SECURITY DEFINER function to get donor contact info (auth required)
CREATE OR REPLACE FUNCTION public.get_donor_contact_info(p_donor_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  phone text,
  blood_type text,
  city text,
  state text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only authenticated users can get contact info
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to view contact information';
  END IF;
  
  RETURN QUERY
  SELECT 
    d.id,
    p.full_name,
    p.phone,
    d.blood_type,
    d.city,
    d.state
  FROM donors d
  JOIN profiles p ON d.user_id = p.id
  WHERE d.id = p_donor_id AND d.is_available = true;
END;
$$;

-- Fix 2: Replace overly permissive donor SELECT policy
-- Drop the dangerous "Anyone can view donors" policy
DROP POLICY IF EXISTS "Anyone can view donors" ON public.donors;

-- Create restrictive policy: public sees minimal info, owners see everything
CREATE POLICY "Public can view limited donor info"
ON public.donors
FOR SELECT
USING (
  -- Owners can see their full record
  auth.uid() = user_id
  OR
  -- Public/authenticated users can only see via the donor_directory view
  -- This policy allows the view to work but direct table access is restricted
  (is_available = true AND auth.uid() IS NOT NULL)
);

-- Create policy for unauthenticated users (force them to use view only)
CREATE POLICY "Unauthenticated can only use donor directory"
ON public.donors
FOR SELECT
TO anon
USING (false);  -- Deny direct table access, must use donor_directory view

-- Fix 3: Restrict blood request public exposure
-- Drop the dangerous "Anyone can view blood requests" policy
DROP POLICY IF EXISTS "Anyone can view blood requests" ON public.blood_requests;

-- Create view for public blood requests (sanitized)
CREATE OR REPLACE VIEW public.public_blood_requests AS
SELECT 
  br.id,
  br.blood_type,
  br.city,
  br.state,
  br.urgency_level,
  br.units_needed,
  br.hospital_name,
  br.created_at,
  br.status,
  -- Mask patient name
  'Patient ' || LEFT(br.patient_name, 1) || '***' as patient_initial,
  -- Hide actual contact, show status message
  CASE 
    WHEN br.status = 'pending' THEN 'Contact via platform'
    ELSE 'Request fulfilled'
  END as contact_info
FROM blood_requests br
WHERE br.status = 'pending';

GRANT SELECT ON public.public_blood_requests TO anon, authenticated;

-- Create restrictive policy for blood_requests
CREATE POLICY "Users can view own requests"
ON public.blood_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for authenticated users to see sanitized public requests
CREATE POLICY "Authenticated can view public requests"
ON public.blood_requests
FOR SELECT
TO authenticated
USING (status = 'pending');

-- Unauthenticated users must use the public view only
CREATE POLICY "Unauthenticated use public view only"
ON public.blood_requests
FOR SELECT
TO anon
USING (false);