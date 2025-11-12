-- Fix profiles table RLS policy to restrict access to own profile only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Add database constraints for input validation on donors table
ALTER TABLE public.donors 
DROP CONSTRAINT IF EXISTS blood_type_check;

ALTER TABLE public.donors 
ADD CONSTRAINT blood_type_check 
CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'));

ALTER TABLE public.donors 
DROP CONSTRAINT IF EXISTS address_length_check;

ALTER TABLE public.donors 
ADD CONSTRAINT address_length_check 
CHECK (char_length(address) BETWEEN 10 AND 200);

ALTER TABLE public.donors 
DROP CONSTRAINT IF EXISTS city_length_check;

ALTER TABLE public.donors 
ADD CONSTRAINT city_length_check 
CHECK (char_length(city) BETWEEN 2 AND 50);

ALTER TABLE public.donors 
DROP CONSTRAINT IF EXISTS state_length_check;

ALTER TABLE public.donors 
ADD CONSTRAINT state_length_check 
CHECK (char_length(state) BETWEEN 2 AND 50);

-- Add database constraints for input validation on blood_requests table
ALTER TABLE public.blood_requests 
DROP CONSTRAINT IF EXISTS blood_type_check;

ALTER TABLE public.blood_requests 
ADD CONSTRAINT blood_type_check 
CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'));

ALTER TABLE public.blood_requests 
DROP CONSTRAINT IF EXISTS units_range_check;

ALTER TABLE public.blood_requests 
ADD CONSTRAINT units_range_check 
CHECK (units_needed BETWEEN 1 AND 10);

ALTER TABLE public.blood_requests 
DROP CONSTRAINT IF EXISTS patient_name_length_check;

ALTER TABLE public.blood_requests 
ADD CONSTRAINT patient_name_length_check 
CHECK (char_length(patient_name) BETWEEN 2 AND 100);

ALTER TABLE public.blood_requests 
DROP CONSTRAINT IF EXISTS hospital_name_length_check;

ALTER TABLE public.blood_requests 
ADD CONSTRAINT hospital_name_length_check 
CHECK (char_length(hospital_name) BETWEEN 3 AND 150);

ALTER TABLE public.blood_requests 
DROP CONSTRAINT IF EXISTS city_length_check;

ALTER TABLE public.blood_requests 
ADD CONSTRAINT city_length_check 
CHECK (char_length(city) BETWEEN 2 AND 50);

ALTER TABLE public.blood_requests 
DROP CONSTRAINT IF EXISTS state_length_check;

ALTER TABLE public.blood_requests 
ADD CONSTRAINT state_length_check 
CHECK (char_length(state) BETWEEN 2 AND 50);

ALTER TABLE public.blood_requests 
DROP CONSTRAINT IF EXISTS additional_notes_length_check;

ALTER TABLE public.blood_requests 
ADD CONSTRAINT additional_notes_length_check 
CHECK (additional_notes IS NULL OR char_length(additional_notes) <= 500);