import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionWithCategory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TransactionForm from "@/components/transaction-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TransactionTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<TransactionWithCategory | undefined>(undefined);
  const [transactionToDelete, setTransactionToDelete] = useState<TransactionWithCategory | undefined>(undefined);

  const { data: transactions, isLoading } = useQuery<TransactionWithCategory[]>({
    queryKey: ["/api/transactions"],
  });

  const deleteTransaction = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/categories"] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete transaction: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleEditClick = (transaction: TransactionWithCategory) => {
    setTransactionToEdit(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (transaction: TransactionWithCategory) => {
    setTransactionToDelete(transaction);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction.mutate(transactionToDelete.id);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Transactions</h2>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                  <TableHead className="text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableHead>
                  <TableHead className="text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Transactions</h2>
        <Button onClick={() => {
          setTransactionToEdit(undefined);
          setIsFormOpen(true);
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Transaction
        </Button>
      </div>

      <div className="rounded-lg border">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-secondary/50">
                    <TableCell className="whitespace-nowrap text-sm text-mutedForeground">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-mutedForeground">
                      {transaction.category && (
                        <div className="flex items-center">
                          <div
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: transaction.category.color }}
                          ></div>
                          {transaction.category.name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className={`whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === "expense" ? "text-destructive" : "text-success"
                    }`}>
                      {transaction.type === "expense" ? "-" : "+"}${Number(transaction.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary/80 h-8"
                        onClick={() => handleEditClick(transaction)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive/80 h-8"
                        onClick={() => handleDeleteClick(transaction)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-mutedForeground">
                    No transactions found. Add your first transaction to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        transactionToEdit={transactionToEdit}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transaction. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
