import { useState } from "react";
import { TransactionsHeader } from "@/components/transactions/TransactionsHeader";
import { TransactionsStats } from "@/components/transactions/TransactionsStats";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { NewTransactionModal } from "@/components/transactions/NewTransactionModal";
import { useFinance } from "@/context/FinanceContext";

export const TransactionsPage = () => {
  const {
    accounts,
    totalCredits,
    totalDebits,
    creditTransactionsCount,
    debitTransactionsCount,
  } = useFinance();

  const [modalOpen, setModalOpen] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <TransactionsHeader onNewTransaction={() => setModalOpen(true)} />

      <TransactionsStats
        totalTransactions={totalCount}
        totalCredits={totalCredits}
        totalDebits={totalDebits}
        creditTransactionsCount={creditTransactionsCount}
        debitTransactionsCount={debitTransactionsCount}
      />

      <TransactionsTable
        accounts={accounts}
        onTotalCountChange={setTotalCount}
      />

      <NewTransactionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};
