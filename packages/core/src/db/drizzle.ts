import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";
import { Config } from "sst/node/config";
import { fetch } from "undici";
// create the connection
const connection = connect({
  url: Config.DATABASE_URL,
  fetch,
});

export const db = drizzle(connection);
