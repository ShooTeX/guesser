import type { InferModel } from "drizzle-orm";
import {
  smallint,
  boolean,
  index,
  mysqlTable,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";

export const questions = mysqlTable(
  "questions",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    userId: text("user_id").notNull(),
    question: text("question").notNull(),
    playlistId: varchar("playlist_id", { length: 21 }).notNull(),
    order: smallint("order").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    playlistIdIdx: index("playlist_id_idx").on(table.playlistId),
  })
);

export type QuestionInsert = InferModel<typeof questions, "insert">;
export type Question = InferModel<typeof questions>;

export const answers = mysqlTable(
  "answers",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    order: smallint("order").notNull(),
    userId: text("user_id").notNull(),
    answer: text("answer").notNull(),
    correct: boolean("correct").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
    questionId: varchar("question_id", { length: 21 }).notNull(),
  },
  (table) => ({
    questionIdIdx: index("question_id_idx").on(table.questionId),
  })
);

export type Answer = InferModel<typeof answers>;
export type AnswerInsert = InferModel<typeof answers, "insert">;
