CREATE TYPE "public"."routine_block_type" AS ENUM (
  'study',
  'language',
  'exercise',
  'book',
  'sleep',
  'custom'
);

CREATE TABLE "public"."routine_templates" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "days_of_week" INTEGER[] NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "routine_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."routine_blocks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "template_id" UUID NOT NULL,
  "block_type" "public"."routine_block_type" NOT NULL,
  "reference_id" UUID,
  "reference_name" VARCHAR(255),
  "duration_minutes" INTEGER NOT NULL DEFAULT 30,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "routine_blocks_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."routine_templates"
ADD CONSTRAINT "routine_templates_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."routine_blocks"
ADD CONSTRAINT "routine_blocks_template_id_fkey"
FOREIGN KEY ("template_id") REFERENCES "public"."routine_templates"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
