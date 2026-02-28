-- Ensure the unique index on user emails exists.
DO $$
BEGIN
  PERFORM 1
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname = 'User_email_key';

  IF NOT FOUND THEN
    CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
  END IF;
END;
$$;
