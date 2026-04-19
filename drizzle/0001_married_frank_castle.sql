CREATE TABLE "application_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer DEFAULT 0 NOT NULL,
	"price_paise" integer DEFAULT 0 NOT NULL,
	"max_devices" integer DEFAULT 1 NOT NULL,
	"duration_days" integer DEFAULT 0 NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"features" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "application_plans_slug_idx" ON "application_plans" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "application_plans_active_idx" ON "application_plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "application_plans_sort_idx" ON "application_plans" USING btree ("sort_order");