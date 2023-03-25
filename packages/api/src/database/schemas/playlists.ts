import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";
import { z } from "zod";

export const playlists = mysqlTable("playlists", {
  id: varchar("id", { length: 21 }).primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const playlistSchema = z.object({
  id: z.string().length(21),
  userId: z.string(),
  name: z.string(),
  createdAt: z.date(),
});
