import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";
import { z } from "zod";
import { ValidationError, isZodErrorLike } from "zod-validation-error";

// Custom transaction schema for API validation that matches frontend form
const apiTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  date: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.number().optional(),
  notes: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api
  
  const router = express.Router();
  
  // Categories endpoints
  router.get("/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  
  router.get("/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });
  
  // Transactions endpoints
  router.get("/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });
  
  router.get("/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransactionById(id);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  });
  
  router.post("/transactions", async (req, res) => {
    try {
      // First validate the API format
      const validatedData = apiTransactionSchema.parse(req.body);
      
      // Convert to the format expected by the storage
      const transaction = {
        ...validatedData,
        amount: validatedData.amount.toString(),
        date: new Date(validatedData.date)
      };
      
      const newTransaction = await storage.createTransaction(transaction);
      res.status(201).json(newTransaction);
    } catch (error) {
      if (error instanceof z.ZodError || isZodErrorLike(error)) {
        return res.status(400).json({ error: "Invalid transaction data", details: (error as z.ZodError).errors });
      }
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });
  
  router.put("/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // First validate the API format with partial schema (allowing missing fields for update)
      const validatedData = apiTransactionSchema.partial().parse(req.body);
      
      // Convert to the format expected by the storage
      const transaction: any = { ...validatedData };
      
      // Convert amount and date only if they exist in the update
      if (validatedData.amount !== undefined) {
        transaction.amount = validatedData.amount.toString();
      }
      
      if (validatedData.date !== undefined) {
        transaction.date = new Date(validatedData.date);
      }
      
      const updatedTransaction = await storage.updateTransaction(id, transaction);
      
      if (!updatedTransaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.json(updatedTransaction);
    } catch (error) {
      if (error instanceof z.ZodError || isZodErrorLike(error)) {
        return res.status(400).json({ error: "Invalid transaction data", details: (error as z.ZodError).errors });
      }
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });
  
  router.delete("/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTransaction(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });
  
  // Analytics endpoints
  router.get("/analytics/monthly", async (req, res) => {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 6;
      const data = await storage.getMonthlyExpenses(months);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly expenses" });
    }
  });
  
  router.get("/analytics/categories", async (req, res) => {
    try {
      const data = await storage.getCategoryExpenses();
      const categories = await storage.getAllCategories();
      
      // Combine category data with expenses
      const result = data.map(item => {
        const category = categories.find(c => c.id === item.categoryId);
        return {
          ...item,
          category
        };
      });
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category expenses" });
    }
  });
  
  router.get("/analytics/summary", async (req, res) => {
    try {
      const summary = await storage.getSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch summary data" });
    }
  });

  app.use("/api", router);

  const httpServer = createServer(app);

  return httpServer;
}
