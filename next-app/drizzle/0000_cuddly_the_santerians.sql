CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "administrators" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"display_name" varchar(100) DEFAULT 'Administrateur' NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"email" varchar(150),
	"service" varchar(100) NOT NULL,
	"appointment_date" date NOT NULL,
	"appointment_time" time NOT NULL,
	"notes" text,
	"status" "appointment_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(180) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"excerpt" varchar(300) NOT NULL,
	"content" text NOT NULL,
	"cover_object_key" varchar(255),
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(150) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_number" varchar(50) NOT NULL,
	"patient_name" varchar(100) NOT NULL,
	"access_code_hash" varchar(255) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"object_key" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" date,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" varchar(64) PRIMARY KEY NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"window_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "administrators_username_unique" ON "administrators" USING btree ("username");--> statement-breakpoint
CREATE INDEX "appointments_date_status_idx" ON "appointments" USING btree ("appointment_date","status");--> statement-breakpoint
CREATE UNIQUE INDEX "blog_posts_slug_unique" ON "blog_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_posts_published_idx" ON "blog_posts" USING btree ("is_published","published_at");--> statement-breakpoint
CREATE INDEX "contact_messages_read_date_idx" ON "contact_messages" USING btree ("is_read","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "patient_results_object_key_unique" ON "patient_results" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "patient_results_number_active_idx" ON "patient_results" USING btree ("patient_number","is_active");