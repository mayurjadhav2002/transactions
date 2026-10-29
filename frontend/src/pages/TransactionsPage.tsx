import { useState } from "react";
import { TransactionsHeader } from "@/components/transactions/TransactionsHeader";
import { TransactionsStats } from "@/components/transactions/TransactionsStats";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { NewTransactionModal } from "@/components/transactions/NewTransactionModal";
import { QueryErrorBanner } from "@/components/common/QueryErrorBanner";
import { useFinance } from "@/context/FinanceContext";

export const TransactionsPage = () => {
  const {
    transactions,
    accounts,
    totalCredits,
    totalDebits,
    creditTransactionsCount,
    debitTransactionsCount,
    isTransactionsLoading,
    isTransactionsFetching,
    isTransactionsError,
    transactionsError,
    refetchTransactions,
  } = useFinance();

  const [modalOpen, setModalOpen] = useState(false);

  const errorMessage =
    transactionsError instanceof Error
      ? transactionsError.message
      : "Could not load transactions from the ledger service.";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <TransactionsHeader onNewTransaction={() => setModalOpen(true)} />

      {isTransactionsError && (
        <QueryErrorBanner
          title="Transactions Synchronization Failed"
          message={errorMessage}
          onRetry={refetchTransactions}
          isRetrying={isTransactionsFetching}
        />
      )}

      <TransactionsStats
        totalTransactions={transactions.length}
        totalCredits={totalCredits}
        totalDebits={totalDebits}
        creditTransactionsCount={creditTransactionsCount}
        debitTransactionsCount={debitTransactionsCount}
      />

      <TransactionsTable
        transactions={transactions}
        accounts={accounts}
        isLoading={isTransactionsLoading}
        isFetching={isTransactionsFetching}
        isError={isTransactionsError}
        onRetry={refetchTransactions}
      />

      <NewTransactionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};
