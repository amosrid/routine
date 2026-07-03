CREATE TABLE "public"."todo_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "title" VARCHAR(160) NOT NULL,
  "due_date" DATE,
  "is_completed" BOOLEAN NOT NULL DEFAULT false,
  "completed_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "todo_items_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."todo_items"
ADD CONSTRAINT "todo_items_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."todo_items" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own todo items"
ON "public"."todo_items"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
