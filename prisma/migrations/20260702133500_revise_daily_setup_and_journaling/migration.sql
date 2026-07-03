ALTER TYPE "public"."routine_block_type" ADD VALUE IF NOT EXISTS 'morning_journal';
ALTER TYPE "public"."routine_block_type" ADD VALUE IF NOT EXISTS 'night_journal';

CREATE TYPE "public"."journal_type" AS ENUM ('morning', 'night');

ALTER TABLE "public"."daily_routines"
ADD COLUMN "is_setup_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "setup_locked_at" TIMESTAMPTZ(6);

ALTER TABLE "public"."daily_routine_items"
ADD COLUMN "is_setup_placeholder" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "public"."journal_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "daily_routine_item_id" UUID,
    "log_date" DATE NOT NULL,
    "journal_type" "public"."journal_type" NOT NULL,
    "plans" TEXT,
    "reflection" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "journal_logs_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."journal_logs"
ADD CONSTRAINT "journal_logs_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."journal_logs"
ADD CONSTRAINT "journal_logs_daily_routine_item_id_fkey"
FOREIGN KEY ("daily_routine_item_id") REFERENCES "public"."daily_routine_items"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
