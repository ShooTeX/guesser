import { mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

export const playlists = mysqlTable("playlists", {
  id: varchar("id", { length: 21 }).primaryKey(),
  name: text("name").notNull(),
});

export const questions = mysqlTable("questions", {
  id: varchar("id", { length: 21 }).primaryKey(),
  question: text("question").notNull(),
  playlistId: varchar("id", { length: 21 }).references(() => playlists.id),
});
