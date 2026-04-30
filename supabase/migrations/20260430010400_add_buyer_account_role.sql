-- Make buyer the canonical account role while migrating legacy customer rows.

UPDATE public.users
SET role = 'buyer'
WHERE role = 'customer';

ALTER TABLE public.users
    ALTER COLUMN role SET DEFAULT 'buyer';

ALTER TABLE public.users
    DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
    ADD CONSTRAINT users_role_check
    CHECK (role IN ('admin', 'buyer', 'seller', 'rider'));