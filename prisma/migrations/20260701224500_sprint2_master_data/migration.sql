CREATE TYPE "public"."book_status" AS ENUM ('reading', 'completed', 'paused');

CREATE TABLE "public"."study_subjects" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "name_normalized" VARCHAR(100) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "study_subjects_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "study_subjects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "study_subjects_user_id_name_normalized_key"
ON "public"."study_subjects"("user_id", "name_normalized");

CREATE TABLE "public"."user_languages" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "name_normalized" VARCHAR(100) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_languages_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_languages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "user_languages_user_id_name_normalized_key"
ON "public"."user_languages"("user_id", "name_normalized");

CREATE TABLE "public"."exercise_types" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "name_normalized" VARCHAR(100) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "exercise_types_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "exercise_types_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "exercise_types_user_id_name_normalized_key"
ON "public"."exercise_types"("user_id", "name_normalized");

CREATE TABLE "public"."books" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "author" VARCHAR(255),
  "status" "public"."book_status" NOT NULL DEFAULT 'reading',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "books_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "books_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "public"."study_subjects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_languages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."exercise_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."books" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own study subjects"
ON "public"."study_subjects"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own languages"
ON "public"."user_languages"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own exercise types"
ON "public"."exercise_types"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own books"
ON "public"."books"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
