CREATE TABLE "public"."daily_routines" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "routine_date" DATE NOT NULL,
  "template_id" UUID,
  "template_name" VARCHAR(100) NOT NULL,
  "score_percentage" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "daily_routines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."daily_routine_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "daily_routine_id" UUID NOT NULL,
  "source_block_id" UUID,
  "block_type" "public"."routine_block_type" NOT NULL,
  "reference_id" UUID,
  "reference_name" VARCHAR(255),
  "display_name" VARCHAR(255) NOT NULL,
  "start_time" TIME(0),
  "end_time" TIME(0),
  "duration_minutes" INTEGER NOT NULL,
  "actual_duration" INTEGER,
  "sort_order" INTEGER NOT NULL,
  "is_completed" BOOLEAN NOT NULL DEFAULT false,
  "is_skipped" BOOLEAN NOT NULL DEFAULT false,
  "skip_reason" VARCHAR(255),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "daily_routine_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "daily_routines_user_id_routine_date_key"
ON "public"."daily_routines"("user_id", "routine_date");

ALTER TABLE "public"."daily_routines"
ADD CONSTRAINT "daily_routines_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."daily_routines"
ADD CONSTRAINT "daily_routines_template_id_fkey"
FOREIGN KEY ("template_id") REFERENCES "public"."routine_templates"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."daily_routine_items"
ADD CONSTRAINT "daily_routine_items_daily_routine_id_fkey"
FOREIGN KEY ("daily_routine_id") REFERENCES "public"."daily_routines"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."daily_routines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."daily_routine_items" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own daily routines"
ON "public"."daily_routines"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own daily routine items"
ON "public"."daily_routine_items"
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM "public"."daily_routines"
    WHERE "public"."daily_routines"."id" = "public"."daily_routine_items"."daily_routine_id"
      AND "public"."daily_routines"."user_id" = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "public"."daily_routines"
    WHERE "public"."daily_routines"."id" = "public"."daily_routine_items"."daily_routine_id"
      AND "public"."daily_routines"."user_id" = auth.uid()
  )
);
