-- Seed requested accounts for admin, buyer, seller, and rider.

INSERT INTO public.users (email, password_hash, first_name, last_name, role, is_verified)
VALUES
    ('admin', 'scrypt:32768:8:1$z4qJwpXRF9KGX1tf$b6b8e64dd487e8f85bc4170517db7623675061de039eaa17d3f2d7159f5a558f7bae3b69116496788aeeb7f3fcb003779f67ab14ecf34edddf82c69a6b9984a6', 'System', 'Admin', 'admin', TRUE),
    ('buyer', 'scrypt:32768:8:1$p0bw4yW7xmBx8kFG$d779ea896d67665efb6461f5d1bf1d853a5417e34d547eb20c590d0fbf18472641fee7fde61006082a9cf849ad337642e3364dcfe33c6f3c67fd03c6652d9811', 'Seed', 'Buyer', 'buyer', TRUE),
    ('seller', 'scrypt:32768:8:1$W1dC8csIJ6LGAKPb$8b4394fcfcb00ef3df3ce22c179c42bd47ff44fa6e9b126cbd9bc7537eb09df2d4256aac0119ed86e5310c6a87e260170cb3c775a961809a50259da274ab8e27', 'Seed', 'Seller', 'seller', TRUE),
    ('rider', 'scrypt:32768:8:1$SY6BO50I5I2wkYI3$071df46db5a1d6eeac62d8ab2ad847dd274e13a7e13fa0eaa6212e3496e1a0550ddf6be1c0f18fc598244f5573e12028c1c24e1b84574a9f5f3b05baae9d37ef', 'Seed', 'Rider', 'rider', TRUE)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_verified = EXCLUDED.is_verified;

INSERT INTO public.sellers (user_id, business_name, category, verified, shop_status, status)
SELECT u.id, 'Seed Seller Store', 'Food', TRUE, 'active', 'active'
FROM public.users u
WHERE u.email = 'seller'
ON CONFLICT (user_id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    category = EXCLUDED.category,
    verified = EXCLUDED.verified,
    shop_status = EXCLUDED.shop_status,
    status = EXCLUDED.status;

INSERT INTO public.riders (user_id, vehicle_type, driver_license, verified, rider_status, availability, status)
SELECT u.id, 'Motorcycle', 'RID-SEED-001', TRUE, 'active', 'available', 'active'
FROM public.users u
WHERE u.email = 'rider'
ON CONFLICT (user_id) DO UPDATE SET
    vehicle_type = EXCLUDED.vehicle_type,
    driver_license = EXCLUDED.driver_license,
    verified = EXCLUDED.verified,
    rider_status = EXCLUDED.rider_status,
    availability = EXCLUDED.availability,
    status = EXCLUDED.status;