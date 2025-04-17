import { 
  users, 
  type User, 
  type InsertUser, 
  categories, 
  type Category, 
  type InsertCategory,
  transactions,
  type Transaction,
  type InsertTransaction,
  type TransactionWithCategory
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Transactions
  getAllTransactions(): Promise<TransactionWithCategory[]>;
  getTransactionById(id: number): Promise<TransactionWithCategory | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Analytics
  getMonthlyExpenses(months: number): Promise<Array<{month: string, amount: number}>>;
  getCategoryExpenses(): Promise<Array<{categoryId: number, amount: number}>>;
  getSummary(): Promise<{
    totalExpenses: number;
    totalIncome: number;
    balance: number;
    budgetUsed: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private transactions: Map<number, Transaction>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.transactions = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentTransactionId = 1;
    
    // Initialize with default categories
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories() {
    const defaultCategories: InsertCategory[] = [
      { name: 'Food', color: '#3b82f6', type: 'expense' },
      { name: 'Housing', color: '#8b5cf6', type: 'expense' },
      { name: 'Transport', color: '#ec4899', type: 'expense' },
      { name: 'Entertainment', color: '#f59e0b', type: 'expense' },
      { name: 'Other', color: '#10b981', type: 'expense' },
      { name: 'Income', color: '#10b981', type: 'income' }
    ];
    
    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) {
      return undefined;
    }
    
    const updatedCategory = { ...existingCategory, ...category };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  // Transaction methods
  async getAllTransactions(): Promise<TransactionWithCategory[]> {
    return Array.from(this.transactions.values()).map(transaction => {
      const category = transaction.categoryId ? this.categories.get(transaction.categoryId) : undefined;
      return { ...transaction, category };
    });
  }
  
  async getTransactionById(id: number): Promise<TransactionWithCategory | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      return undefined;
    }
    
    const category = transaction.categoryId ? this.categories.get(transaction.categoryId) : undefined;
    return { ...transaction, category };
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const newTransaction: Transaction = { ...transaction, id };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }
  
  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existingTransaction = this.transactions.get(id);
    if (!existingTransaction) {
      return undefined;
    }
    
    const updatedTransaction = { ...existingTransaction, ...transaction };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }
  
  // Analytics methods
  async getMonthlyExpenses(months: number = 6): Promise<Array<{month: string, amount: number}>> {
    const now = new Date();
    const result: Array<{month: string, amount: number}> = [];
    
    for (let i = 0; i < months; i++) {
      const targetMonth = new Date(now);
      targetMonth.setMonth(now.getMonth() - i);
      
      const monthName = targetMonth.toLocaleString('default', { month: 'short' });
      const monthExpenses = Array.from(this.transactions.values())
        .filter(t => {
          const transactionDate = new Date(t.date);
          return t.type === 'expense' && 
                 transactionDate.getMonth() === targetMonth.getMonth() && 
                 transactionDate.getFullYear() === targetMonth.getFullYear();
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      result.unshift({ month: monthName, amount: monthExpenses });
    }
    
    return result;
  }
  
  async getCategoryExpenses(): Promise<Array<{categoryId: number, amount: number}>> {
    const categoryExpenses = new Map<number, number>();
    
    // Initialize with all categories
    for (const category of this.categories.values()) {
      if (category.type === 'expense') {
        categoryExpenses.set(category.id, 0);
      }
    }
    
    // Sum up transactions by category
    for (const transaction of this.transactions.values()) {
      if (transaction.type === 'expense' && transaction.categoryId) {
        const currentAmount = categoryExpenses.get(transaction.categoryId) || 0;
        categoryExpenses.set(transaction.categoryId, currentAmount + Number(transaction.amount));
      }
    }
    
    return Array.from(categoryExpenses.entries()).map(([categoryId, amount]) => ({
      categoryId,
      amount
    }));
  }
  
  async getSummary(): Promise<{
    totalExpenses: number;
    totalIncome: number;
    balance: number;
    budgetUsed: number;
  }> {
    const transactions = Array.from(this.transactions.values());
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const balance = totalIncome - totalExpenses;
    
    // Assuming a budget of $3000 for demonstration purposes
    const budgetUsed = Math.min((totalExpenses / 3000) * 100, 100);
    
    return {
      totalExpenses,
      totalIncome,
      balance,
      budgetUsed
    };
  }
}

export const storage = new MemStorage();
