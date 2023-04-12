import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

const conn = connect({ url: process.env.DATABASE_URL });
export const database = drizzle(conn);
