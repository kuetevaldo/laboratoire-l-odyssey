import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const appointmentStatus = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export const administrators = pgTable(
  "administrators",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 50 }).notNull(),
    displayName: varchar("display_name", { length: 100 }).notNull().default("Administrateur"),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("administrators_username_unique").on(table.username)],
);

export const appointments = pgTable(
  "appointments",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 30 }).notNull(),
    email: varchar("email", { length: 150 }),
    service: varchar("service", { length: 100 }).notNull(),
    appointmentDate: date("appointment_date", { mode: "string" }).notNull(),
    appointmentTime: time("appointment_time").notNull(),
    notes: text("notes"),
    status: appointmentStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("appointments_date_status_idx").on(table.appointmentDate, table.status)],
);

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 150 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("contact_messages_read_date_idx").on(table.isRead, table.createdAt)],
);

export const patientResults = pgTable(
  "patient_results",
  {
    id: serial("id").primaryKey(),
    patientNumber: varchar("patient_number", { length: 50 }).notNull(),
    patientName: varchar("patient_name", { length: 100 }).notNull(),
    accessCodeHash: varchar("access_code_hash", { length: 255 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    objectKey: varchar("object_key", { length: 255 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    expiresAt: date("expires_at", { mode: "string" }),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("patient_results_object_key_unique").on(table.objectKey),
    index("patient_results_number_active_idx").on(table.patientNumber, table.isActive),
  ],
);

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    excerpt: varchar("excerpt", { length: 300 }).notNull(),
    content: text("content").notNull(),
    coverObjectKey: varchar("cover_object_key", { length: 255 }),
    isPublished: boolean("is_published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("blog_posts_slug_unique").on(table.slug),
    index("blog_posts_published_idx").on(table.isPublished, table.publishedAt),
  ],
);

export const rateLimits = pgTable("rate_limits", {
  key: varchar("key", { length: 64 }).primaryKey(),
  attempts: integer("attempts").notNull().default(0),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Administrator = typeof administrators.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type PatientResult = typeof patientResults.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
