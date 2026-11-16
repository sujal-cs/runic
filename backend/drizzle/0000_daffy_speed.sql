CREATE TABLE "problems" (
	"id" serial PRIMARY KEY NOT NULL,
	"frontend_id" varchar(16) NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"difficulty" varchar(16) NOT NULL,
	"description" text NOT NULL,
	"examples" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"constraints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"test_cases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"code_snippets" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"acceptance_rate" numeric,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "problems_frontend_id_unique" UNIQUE("frontend_id"),
	CONSTRAINT "problems_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"problem_id" integer NOT NULL,
	"language" varchar(32) NOT NULL,
	"code" text NOT NULL,
	"status" varchar(32) NOT NULL,
	"runtime_ms" integer,
	"result" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(32) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_problems_difficulty" ON "problems" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "idx_problems_tags" ON "problems" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "idx_submissions_user" ON "submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_submissions_user_created" ON "submissions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_submissions_problem" ON "submissions" USING btree ("problem_id");