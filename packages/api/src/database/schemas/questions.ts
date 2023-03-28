import type { InferModel } from "drizzle-orm/mysql-core";
import { smallint } from "drizzle-orm/mysql-core";
import { uniqueIndex } from "drizzle-orm/mysql-core";
import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";
import { playlists } from "./playlists";

export const questions = mysqlTable(
  "questions",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    userId: text("user_id").notNull(),
    question: text("question").notNull(),
    playlistId: varchar("playlist_id", { length: 21 })
      .references(() => playlists.id, { onDelete: "cascade" })
      .notNull(),
    order: smallint("order").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    order_idx: uniqueIndex("order_idx").on(table.order, table.playlistId),
  })
);

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
export type AnswerInsert = InferModel<typeof answers, "insert">;
