CREATE TABLE "public"."user_streaks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "current_streak" INTEGER NOT NULL DEFAULT 0,
  "longest_streak" INTEGER NOT NULL DEFAULT 0,
  "last_active_date" DATE,
  "last_evaluated_date" DATE,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "user_streaks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_streaks_user_id_key"
ON "public"."user_streaks"("user_id");

ALTER TABLE "public"."user_streaks"
ADD CONSTRAINT "user_streaks_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."user_streaks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own streak"
ON "public"."user_streaks"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
