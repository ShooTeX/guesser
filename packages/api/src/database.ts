import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { DATABASE_URL } from "./environment";

const conn = connect({ url: DATABASE_URL });
export const database = drizzle(conn);
