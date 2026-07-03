CREATE TABLE "public"."study_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "subject_id" UUID NOT NULL,
  "daily_routine_item_id" UUID,
  "log_date" DATE NOT NULL,
  "duration_minutes" INTEGER NOT NULL,
  "activity" VARCHAR(255),
  "material" VARCHAR(255),
  "summary" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "study_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."language_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "language_id" UUID NOT NULL,
  "daily_routine_item_id" UUID,
  "log_date" DATE NOT NULL,
  "duration_minutes" INTEGER NOT NULL,
  "material" VARCHAR(255),
  "vocabulary" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "language_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."exercise_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "exercise_type_id" UUID NOT NULL,
  "daily_routine_item_id" UUID,
  "log_date" DATE NOT NULL,
  "duration_minutes" INTEGER NOT NULL,
  "sets" INTEGER,
  "reps" INTEGER,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "exercise_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."book_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "book_id" UUID NOT NULL,
  "daily_routine_item_id" UUID,
  "log_date" DATE NOT NULL,
  "duration_minutes" INTEGER NOT NULL,
  "pages_read" INTEGER,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "book_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."sleep_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "daily_routine_item_id" UUID,
  "wake_date" DATE NOT NULL,
  "sleep_time" TIME(0) NOT NULL,
  "wake_time" TIME(0) NOT NULL,
  "duration_minutes" INTEGER NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sleep_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sleep_logs_user_id_wake_date_key"
ON "public"."sleep_logs"("user_id", "wake_date");

ALTER TABLE "public"."study_logs" ADD CONSTRAINT "study_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."study_logs" ADD CONSTRAINT "study_logs_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."study_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."study_logs" ADD CONSTRAINT "study_logs_daily_routine_item_id_fkey" FOREIGN KEY ("daily_routine_item_id") REFERENCES "public"."daily_routine_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."language_logs" ADD CONSTRAINT "language_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."language_logs" ADD CONSTRAINT "language_logs_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."user_languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."language_logs" ADD CONSTRAINT "language_logs_daily_routine_item_id_fkey" FOREIGN KEY ("daily_routine_item_id") REFERENCES "public"."daily_routine_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."exercise_logs" ADD CONSTRAINT "exercise_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."exercise_logs" ADD CONSTRAINT "exercise_logs_exercise_type_id_fkey" FOREIGN KEY ("exercise_type_id") REFERENCES "public"."exercise_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."exercise_logs" ADD CONSTRAINT "exercise_logs_daily_routine_item_id_fkey" FOREIGN KEY ("daily_routine_item_id") REFERENCES "public"."daily_routine_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."book_logs" ADD CONSTRAINT "book_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."book_logs" ADD CONSTRAINT "book_logs_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."book_logs" ADD CONSTRAINT "book_logs_daily_routine_item_id_fkey" FOREIGN KEY ("daily_routine_item_id") REFERENCES "public"."daily_routine_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."sleep_logs" ADD CONSTRAINT "sleep_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."sleep_logs" ADD CONSTRAINT "sleep_logs_daily_routine_item_id_fkey" FOREIGN KEY ("daily_routine_item_id") REFERENCES "public"."daily_routine_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."study_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."language_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."exercise_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."book_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."sleep_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own study logs" ON "public"."study_logs" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own language logs" ON "public"."language_logs" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own exercise logs" ON "public"."exercise_logs" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own book logs" ON "public"."book_logs" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own sleep logs" ON "public"."sleep_logs" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
