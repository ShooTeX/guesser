import type { InferModel } from "drizzle-orm/mysql-core";
import { mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const playlists = mysqlTable("playlists", {
  id: varchar("id", { length: 21 }).primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Playlist = InferModel<typeof playlists>;

export const questions = mysqlTable("questions", {
  id: varchar("id", { length: 21 }).primaryKey(),
  userId: text("user_id").notNull(),
  question: text("question").notNull(),
  playlistId: varchar("id", { length: 21 }).references(() => playlists.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Question = InferModel<typeof questions>;
