# Migration 009: Add Admins Table

## What This Does
- Creates an `admins` table to control who can access the Admin page
- Only users in this table will see the Admin link in the dropdown menu
- Only admins can add/remove other admins

## How to Apply

### Step 1: Run the Migration
```bash
# From the project root
supabase db push
```

### Step 2: Add Yourself and Cohen as Admins

Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Add Eric Adams as admin (replace with your actual email)
INSERT INTO public.admins (user_id)
SELECT id FROM public.users WHERE email = 'your-email@example.com';

-- Add Cohen Adams as admin (replace with Cohen's actual email)
INSERT INTO public.admins (user_id)
SELECT id FROM public.users WHERE email = 'cohen-email@example.com';
```

### Step 3: Verify

Check that the admins were added:

```sql
SELECT 
  a.id,
  u.email,
  u.display_name,
  a.created_at
FROM public.admins a
JOIN public.users u ON a.user_id = u.id;
```

You should see both Eric and Cohen in the results.

## What Changes in the App

After this migration:
- ✅ Only admins will see the "Admin" link in the header dropdown
- ✅ Non-admins trying to access `/admin` will be redirected
- ✅ The Admin page will check if the user is an admin before rendering

## Rollback (if needed)

```sql
DROP TABLE IF EXISTS public.admins CASCADE;
```

