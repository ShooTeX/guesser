import type { InferModel } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  int,
} from "drizzle-orm/mysql-core";

export const playlists = mysqlTable("playlists", {
  id: varchar("id", { length: 21 }).primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  shortDesc: text("short_desc"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  playCount: int("play_count").notNull().default(0),
});

export type PlaylistsInsert = InferModel<typeof playlists, "insert">;
