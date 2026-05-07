-- ================================================================
-- Migration: Add super_admin role
-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- ================================================================

-- Step 1: Drop the existing role check constraint
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Step 2: Add updated constraint that includes super_admin
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'admin', 'member'));

-- Step 3: Promote kpaccess@gmail.com to super_admin
UPDATE profiles
  SET role = 'super_admin'
  WHERE email = 'kpaccess@gmail.com';

-- Verify the result
SELECT id, name, email, role FROM profiles WHERE email = 'kpaccess@gmail.com';
