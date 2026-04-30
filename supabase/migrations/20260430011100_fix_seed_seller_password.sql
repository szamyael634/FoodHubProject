-- Correct the seeded seller account password to the requested value.

UPDATE public.users
SET password_hash = 'scrypt:32768:8:1$W1dC8csIJ6LGAKPb$8b4394fcfcb00ef3df3ce22c179c42bd47ff44fa6e9b126cbd9bc7537eb09df2d4256aac0119ed86e5310c6a87e260170cb3c775a961809a50259da274ab8e27'
WHERE email = 'seller';