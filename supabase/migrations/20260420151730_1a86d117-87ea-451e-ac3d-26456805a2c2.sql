-- Create admin user with username 'admin' and password 'admin123'
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT user_id INTO new_user_id FROM public.profiles WHERE username = 'admin' LIMIT 1;
  
  IF new_user_id IS NULL THEN
    -- Insert into auth.users
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'admin@dahira.local',
      crypt('admin123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"username":"admin"}'::jsonb,
      false, '', '', '', ''
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', 'admin@dahira.local'),
      'email', new_user_id::text, now(), now(), now()
    );

    INSERT INTO public.profiles (user_id, username) VALUES (new_user_id, 'admin');
    INSERT INTO public.user_roles (user_id, role) VALUES (new_user_id, 'admin');
  END IF;
END $$;