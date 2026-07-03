CREATE TABLE "public"."profiles" (
  "id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "display_name" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "profiles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "profiles_email_key" ON "public"."profiles"("email");

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
ON "public"."profiles"
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON "public"."profiles"
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON "public"."profiles"
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
