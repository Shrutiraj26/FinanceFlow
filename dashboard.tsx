import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SummaryCard from "@/components/summary-card";
import MonthlyChart from "@/components/monthly-chart";
import CategoryChart from "@/components/category-chart";
import TransactionTable from "@/components/transaction-table";
import TransactionForm from "@/components/transaction-form";

interface SummaryData {
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  budgetUsed: number;
}

export default function Dashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useQuery<SummaryData>({
    queryKey: ["/api/analytics/summary"],
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Transaction
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            {/* Total Expenses */}
            <SummaryCard
              title="Total Expenses"
              value={`-$${summary?.totalExpenses.toFixed(2)}`}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              }
              iconBgClass="bg-red-100"
              valueColor="text-destructive"
            />
            
            {/* Total Income */}
            <SummaryCard
              title="Total Income"
              value={`$${summary?.totalIncome.toFixed(2)}`}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              }
              iconBgClass="bg-green-100"
              valueColor="text-success"
            />
            
            {/* Balance */}
            <SummaryCard
              title="Current Balance"
              value={`$${summary?.balance.toFixed(2)}`}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              }
              iconBgClass="bg-blue-100"
              subtitle="Updated just now"
            />
            
            {/* Budget Status */}
            <SummaryCard
              title="Budget Used"
              value={`${summary?.budgetUsed.toFixed(0)}%`}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              }
              iconBgClass="bg-yellow-100"
              valueColor={summary && summary.budgetUsed > 90 ? "text-destructive" : "text-warning"}
              progress={summary?.budgetUsed}
            />
          </>
        )}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        <div className="md:col-span-8">
          <MonthlyChart />
        </div>
        <div className="md:col-span-4">
          <CategoryChart />
        </div>
      </div>

      {/* Recent transactions */}
      <TransactionTable />

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </>
  );
}
