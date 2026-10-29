import { useState } from "react";
import { TransfersHeader } from "@/components/transfers/TransfersHeader";
import { TransfersStats } from "@/components/transfers/TransfersStats";
import { TransfersTable } from "@/components/transfers/TransfersTable";
import { NewTransferModal } from "@/components/transfers/NewTransferModal";
import { QueryErrorBanner } from "@/components/common/QueryErrorBanner";
import { useFinance } from "@/context/FinanceContext";

export const TransfersPage = () => {
  const {
    transfers,
    totalTransfersSent,
    totalTransfersReceived,
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
      : "Could not load transfer history from the ledger service.";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <TransfersHeader onNewTransfer={() => setModalOpen(true)} />

      {isTransactionsError && (
        <QueryErrorBanner
          title="Transfer History Synchronization Failed"
          message={errorMessage}
          onRetry={refetchTransactions}
          isRetrying={isTransactionsFetching}
        />
      )}

      <TransfersStats
        totalTransfers={transfers.length}
        totalSent={totalTransfersSent}
        totalReceived={totalTransfersReceived}
      />

      <TransfersTable
        transfers={transfers}
        isLoading={isTransactionsLoading}
        isFetching={isTransactionsFetching}
        isError={isTransactionsError}
        onRetry={refetchTransactions}
      />

      <NewTransferModal
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};
