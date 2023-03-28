import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const playlists = mysqlTable("playlists", {
  id: varchar("id", { length: 21 }).primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
