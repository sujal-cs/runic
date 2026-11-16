ALTER TABLE "submissions" ADD COLUMN "message" text;--> statement-breakpoint
CREATE INDEX "idx_submissions_status" ON "submissions" USING btree ("status");