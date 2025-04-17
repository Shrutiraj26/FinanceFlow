import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Category, Transaction } from "@shared/schema";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction;
}

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0" }),
  date: z.string().min(1, { message: "Date is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  categoryId: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TransactionForm({ isOpen, onClose, transactionToEdit }: TransactionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    transactionToEdit?.type as "income" | "expense" || "expense"
  );

  const isEditing = !!transactionToEdit;

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createTransaction = useMutation({
    mutationFn: (data: FormValues) => 
      apiRequest("POST", "/api/transactions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/categories"] });
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create transaction: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateTransaction = useMutation({
    mutationFn: (data: FormValues) => 
      apiRequest("PUT", `/api/transactions/${transactionToEdit?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/categories"] });
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update transaction: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const defaultValues: Partial<FormValues> = {
    type: transactionToEdit?.type as "income" | "expense" || "expense",
    amount: transactionToEdit?.amount ? Number(transactionToEdit.amount) : undefined,
    date: transactionToEdit?.date 
      ? new Date(transactionToEdit.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    description: transactionToEdit?.description || "",
    categoryId: transactionToEdit?.categoryId || undefined,
    notes: transactionToEdit?.notes || "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = (data: FormValues) => {
    if (isEditing) {
      updateTransaction.mutate(data);
    } else {
      createTransaction.mutate(data);
    }
  };
  
  const handleTypeChange = (type: "expense" | "income") => {
    setTransactionType(type);
    form.setValue("type", type);
    
    // Reset category if changing type
    form.setValue("categoryId", undefined);
  };

  const filteredCategories = categories?.filter(
    category => category.type === transactionType
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details of your transaction below." 
              : "Enter the details of your transaction below."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Transaction Type */}
            <div>
              <div className="flex rounded-md shadow-sm">
                <Button
                  type="button"
                  variant={transactionType === "expense" ? "default" : "outline"}
                  className="w-1/2 rounded-r-none"
                  onClick={() => handleTypeChange("expense")}
                >
                  Expense
                </Button>
                <Button
                  type="button"
                  variant={transactionType === "income" ? "default" : "outline"}
                  className="w-1/2 rounded-l-none"
                  onClick={() => handleTypeChange("income")}
                >
                  Income
                </Button>
              </div>
            </div>
            
            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-mutedForeground sm:text-sm">$</span>
                      </div>
                      <Input 
                        {...field} 
                        placeholder="0.00" 
                        className="pl-7" 
                        type="number" 
                        step="0.01"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="e.g. Grocery shopping" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Additional details..." 
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createTransaction.isPending || updateTransaction.isPending}
              >
                {(createTransaction.isPending || updateTransaction.isPending) ? "Saving..." : "Save Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
