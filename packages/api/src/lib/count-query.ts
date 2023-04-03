import { sql } from "drizzle-orm";

export const countQuery = () => {
  return sql<number>`count(*)`;
};
