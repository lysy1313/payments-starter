import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("В backend/.env отсутствует DATABASE_URL");
}

const sql = neon(databaseUrl);

const rows = await sql`
  SELECT * FROM products;
`;

console.table(rows);
