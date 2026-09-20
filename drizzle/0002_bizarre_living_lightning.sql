CREATE TABLE "project_shares" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"owner_email" text NOT NULL,
	"collaborator_email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"max_uses" integer NOT NULL,
	"uses_count" integer DEFAULT 0,
	"revoked" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "project_shares_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "share_otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"share_id" integer NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed" boolean DEFAULT false,
	"attempts" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "share_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"share_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "share_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "project_shares" ADD CONSTRAINT "project_shares_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_otps" ADD CONSTRAINT "share_otps_share_id_project_shares_id_fk" FOREIGN KEY ("share_id") REFERENCES "public"."project_shares"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_sessions" ADD CONSTRAINT "share_sessions_share_id_project_shares_id_fk" FOREIGN KEY ("share_id") REFERENCES "public"."project_shares"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_shares_project" ON "project_shares" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_shares_token" ON "project_shares" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_share_otps_share" ON "share_otps" USING btree ("share_id");--> statement-breakpoint
CREATE INDEX "idx_share_sessions_share" ON "share_sessions" USING btree ("share_id");--> statement-breakpoint
CREATE INDEX "idx_share_sessions_token" ON "share_sessions" USING btree ("token_hash");