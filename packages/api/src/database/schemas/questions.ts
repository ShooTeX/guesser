import type { InferModel } from "drizzle-orm/mysql-core";
import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";
import { z } from "zod";
import { playlists } from "./playlists";

export const questions = mysqlTable("questions", {
  id: varchar("id", { length: 21 }).primaryKey(),
  userId: text("user_id").notNull(),
  question: text("question").notNull(),
  playlistId: varchar("playlist_id", { length: 21 })
    .references(() => playlists.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type QuestionInsert = InferModel<typeof questions, "insert">;
export type Question = InferModel<typeof questions>;

export const answers = mysqlTable("answers", {
  id: varchar("id", { length: 21 }).primaryKey(),
  userId: text("user_id").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  questionId: varchar("question_id", { length: 21 })
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
});

export type Answer = InferModel<typeof answers>;

export const answerSchema = z.object({
  id: z.string().length(21),
  userId: z.string(),
  answer: z.string().min(1),
  questionId: z.string().length(21),
  createdAt: z.date(),
});

export const questionSchema = z.object({
  id: z.string().length(21),
  userId: z.string(),
  question: z.string().min(1),
  playlistId: z.string().length(21),
  createdAt: z.date(),
  answers: z.array(answerSchema.shape.answer).optional(),
});
