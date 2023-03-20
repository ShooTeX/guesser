import { mysqlTable, serial, text, varchar } from "drizzle-orm/mysql-core";

export const questions = mysqlTable("questions", {
  id: varchar("id", { length: 21 }).primaryKey(),
  question: text("question").notNull(),
});

export const playlists = mysqlTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});
