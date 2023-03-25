import type { InferModel } from "drizzle-orm/mysql-core";
import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";
import { z } from "zod";
import { playlists } from "./playlists";

export const questions = mysqlTable("questions", {
  id: varchar("id", { length: 21 }).primaryKey(),
  userId: text("user_id").notNull(),
  question: text("question").notNull(),
  playlistId: varchar("id", { length: 21 })
    .references(() => playlists.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type QuestionInsert = InferModel<typeof questions, "insert">;

export const questionSchema = z.object({
  id: z.string().length(21),
  userId: z.string(),
  question: z.string().min(1),
  playlistId: z.string().length(21),
  createdAt: z.date(),
});
