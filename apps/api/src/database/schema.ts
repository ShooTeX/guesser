import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod/pg";

export const questions = pgTable("questions", {
  id: varchar("id", { length: 21 }).primaryKey(),
  question: text("question").notNull(),
});

export const newQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  questions: integer("questions")
    .array()
    .references(() => questions.id),
});

export const newPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
});
