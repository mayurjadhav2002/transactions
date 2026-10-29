import { useState } from "react";
import { AccountsHeader } from "@/components/accounts/AccountsHeader";
import { AccountsStats } from "@/components/accounts/AccountsStats";
import { AccountsTable } from "@/components/accounts/AccountsTable";
import { AccountDetailsModal } from "@/components/accounts/AccountDetailsModal";
import { CreateAccountModal } from "@/components/dashboard/CreateAccountModal";
import { QueryErrorBanner } from "@/components/common/QueryErrorBanner";
import { useFinance } from "@/context/FinanceContext";
import type { Account } from "@/types";

export const AccountsPage = () => {
  const {
    accounts,
    totalBalance,
    totalCredits,
    totalDebits,
    creditTransactionsCount,
    debitTransactionsCount,
    isAccountsLoading,
    isAccountsFetching,
    isAccountsError,
    accountsError,
    refetchAccounts,
  } = useFinance();

  const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const handleViewDetails = (account: Account) => {
    setSelectedAccount(account);
    setDetailsModalOpen(true);
  };

  const errorMessage =
    accountsError instanceof Error
      ? accountsError.message
      : "Could not load accounts. Please ensure your backend service is running.";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AccountsHeader
        onCreateAccount={() => setCreateAccountModalOpen(true)}
      />

      {isAccountsError && (
        <QueryErrorBanner
          title="Account Synchronization Failed"
          message={errorMessage}
          onRetry={refetchAccounts}
          isRetrying={isAccountsFetching}
        />
      )}

      <AccountsStats
        totalAccounts={accounts.length}
        totalBalance={totalBalance}
        totalCredits={totalCredits}
        totalDebits={totalDebits}
        creditTransactionsCount={creditTransactionsCount}
        debitTransactionsCount={debitTransactionsCount}
      />

      <AccountsTable
        accounts={accounts}
        onViewDetails={handleViewDetails}
        isLoading={isAccountsLoading}
        isFetching={isAccountsFetching}
        isError={isAccountsError}
        onRetry={refetchAccounts}
      />

      <AccountDetailsModal
        account={selectedAccount}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />

      <CreateAccountModal
        open={createAccountModalOpen}
        onOpenChange={setCreateAccountModalOpen}
      />
    </div>
  );
};
