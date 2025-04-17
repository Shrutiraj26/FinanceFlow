import TransactionTable from "@/components/transaction-table";

export default function Transactions() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <p className="text-mutedForeground mt-1">
          View, add, edit, and delete your financial transactions.
        </p>
      </div>
      
      <TransactionTable />
    </>
  );
}
