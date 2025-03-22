/*
  # Fix admin user creation

  1. Changes
    - Add admin user with email admin@example.com if not exists
    - Ensure user exists in both auth.users and public.users tables
    - Handle case where user might exist in one table but not the other

  2. Security
    - Password is set to 'admin123'
    - User will be able to sign in immediately
*/

DO $$ 
DECLARE
  admin_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN 
  -- Create in auth.users if not exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  ) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      role,
      aud,
      created_at,
      updated_at
    ) VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@example.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      'authenticated',
      'authenticated',
      now(),
      now()
    );
  END IF;

  -- Create in public.users if not exists
  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'admin@example.com'
  ) THEN
    INSERT INTO public.users (
      id,
      email,
      role,
      points,
      created_at
    ) VALUES (
      admin_id,
      'admin@example.com',
      'admin',
      1000,
      now()
    );
  END IF;

  -- Update role in public.users if needed
  UPDATE public.users 
  SET role = 'admin'
  WHERE email = 'admin@example.com' AND role != 'admin';
END $$;