/*
  # Add admin user

  1. Changes
    - Add admin user with email admin@example.com
    - Set role as 'admin'
    - Set initial points to 1000

  2. Security
    - Password is set to 'admin123'
    - User will be able to sign in immediately
*/

-- First check if the admin user already exists
DO $$ 
BEGIN 
  -- Only proceed if admin user doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'admin@example.com'
  ) THEN
    -- Insert into public.users table
    INSERT INTO public.users (
      id,
      email,
      role,
      points,
      created_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'admin@example.com',
      'admin',
      1000,
      now()
    );

    -- Insert into auth.users table
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
      '00000000-0000-0000-0000-000000000000',
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
END $$;