import { pgTable, text, serial, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  type: text("type").notNull()
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  color: true,
  type: true
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull().defaultNow(),
  description: text("description").notNull(),
  categoryId: integer("category_id"),
  type: text("type").notNull(),
  notes: text("notes"),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  amount: true,
  date: true,
  description: true,
  categoryId: true,
  type: true,
  notes: true
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Combined transaction with category
export type TransactionWithCategory = Transaction & { 
  category?: Category 
};
