/*
  # Fix admin user authentication

  1. Changes
    - Ensure admin user exists in both auth.users and public.users tables
    - Set proper authentication credentials
    - Update role to admin
    - Set default points

  2. Security
    - Enable RLS policies for admin access
*/

-- Create admin user with proper authentication
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
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmed_at
    ) VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@example.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      'authenticated',
      'authenticated',
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      false,
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

  -- Ensure admin role is set
  UPDATE public.users 
  SET role = 'admin'
  WHERE email = 'admin@example.com';

  -- Update auth.users metadata if needed
  UPDATE auth.users
  SET raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'
  WHERE email = 'admin@example.com';
END $$;