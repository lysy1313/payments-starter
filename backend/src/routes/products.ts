import { Router } from "express";
import { sql } from "../db/client.js";

export const productsRouter = Router();

productsRouter.get("/products", async (_req, res) => {
  const products = await sql`
    SELECT id, name, unit_amount, currency
    FROM products
    WHERE active = true;
  `;

  res.json({ products });
});
