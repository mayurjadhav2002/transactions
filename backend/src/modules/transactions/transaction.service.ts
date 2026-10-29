import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/api-errors";
import { Prisma } from "@/generated/prisma/client";
import type {
  CreateTransactionInput,
  TransferFundsInput,
  ListTransactionsQuery,
} from "./transaction.schema";

export class TransactionService {
  async createTransaction(input: CreateTransactionInput) {
    const { accountId, referenceId, type, amount, description } = input;
    const amountDecimal = new Prisma.Decimal(amount);

    if (amountDecimal.lte(0)) {
      throw new ApiError(
        400,
        "Transaction amount must be greater than 0",
        "INVALID_AMOUNT",
      );
    }

    return prisma.$transaction(
      async (tx) => {
        // 1. Check idempotency: check if referenceId already exists for this account
        const existingTx = await tx.transaction.findUnique({
          where: {
            accountId_referenceId: {
              accountId,
              referenceId,
            },
          },
        });

        if (existingTx) {
          throw new ApiError(
            409,
            `Transaction with referenceId '${referenceId}' already exists for this account`,
            "DUPLICATE_REFERENCE_ID",
          );
        }

        //  target account
        const account = await tx.account.findUnique({
          where: { id: accountId },
        });

        if (!account) {
          throw new ApiError(404, "Account not found", "ACCOUNT_NOT_FOUND");
        }

        const currentBalance = new Prisma.Decimal(account.balance);
        let newBalance: Prisma.Decimal;

        if (type === "DEBIT") {
          if (currentBalance.lt(amountDecimal)) {
            throw new ApiError(
              400,
              `Insufficient funds. Current balance: ${currentBalance.toString()}, requested: ${amountDecimal.toString()}`,
              "INSUFFICIENT_FUNDS",
            );
          }
          newBalance = currentBalance.minus(amountDecimal);
        } else {
          newBalance = currentBalance.plus(amountDecimal);
        }

        // Updating account balance atomically
        await tx.account.update({
          where: { id: accountId },
          data: { balance: newBalance },
        });

        // create transaction record
        const transaction = await tx.transaction.create({
          data: {
            accountId,
            referenceId,
            type,
            amount: amountDecimal,
            balanceAfter: newBalance,
            description: description?.trim() || null,
          },
          include: {
            account: {
              select: {
                id: true,
                accountNumber: true,
                name: true,
                currency: true,
              },
            },
          },
        });

        return transaction;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async transferFunds(input: TransferFundsInput) {
    const { fromAccountId, toAccountId, amount, referenceId, description } =
      input;
    const amountDecimal = new Prisma.Decimal(amount);

    if (amountDecimal.lte(0)) {
      throw new ApiError(
        400,
        "Transfer amount must be greater than 0",
        "INVALID_AMOUNT",
      );
    }

    return prisma.$transaction(
      async (tx) => {
        // Idempotency check on referenceId
        const existingFrom = await tx.transaction.findUnique({
          where: {
            accountId_referenceId: {
              accountId: fromAccountId,
              referenceId,
            },
          },
        });

        if (existingFrom) {
          throw new ApiError(
            409,
            `Transaction with referenceId '${referenceId}' already exists for source account`,
            "DUPLICATE_REFERENCE_ID",
          );
        }

        const [fromAccount, toAccount] = await Promise.all([
          tx.account.findUnique({ where: { id: fromAccountId } }),
          tx.account.findUnique({ where: { id: toAccountId } }),
        ]);

        if (!fromAccount) {
          throw new ApiError(
            404,
            "Source account not found",
            "SOURCE_ACCOUNT_NOT_FOUND",
          );
        }
        if (!toAccount) {
          throw new ApiError(
            404,
            "Destination account not found",
            "DESTINATION_ACCOUNT_NOT_FOUND",
          );
        }

        const fromBalance = new Prisma.Decimal(fromAccount.balance);
        if (fromBalance.lt(amountDecimal)) {
          throw new ApiError(
            400,
            `Insufficient funds in ${fromAccount.name}. Balance: ${fromBalance.toString()}, requested: ${amountDecimal.toString()}`,
            "INSUFFICIENT_FUNDS",
          );
        }

        const newFromBalance = fromBalance.minus(amountDecimal);
        const toBalance = new Prisma.Decimal(toAccount.balance);
        const newToBalance = toBalance.plus(amountDecimal);

        await tx.account.update({
          where: { id: fromAccountId },
          data: { balance: newFromBalance },
        });

        await tx.account.update({
          where: { id: toAccountId },
          data: { balance: newToBalance },
        });

        const debitTx = await tx.transaction.create({
          data: {
            accountId: fromAccountId,
            referenceId,
            type: "DEBIT",
            amount: amountDecimal,
            balanceAfter: newFromBalance,
            description: description || `Transfer to ${toAccount.name}`,
          },
          include: {
            account: {
              select: {
                id: true,
                accountNumber: true,
                name: true,
                currency: true,
              },
            },
          },
        });

        const creditTx = await tx.transaction.create({
          data: {
            accountId: toAccountId,
            referenceId: `${referenceId}-CR`,
            type: "CREDIT",
            amount: amountDecimal,
            balanceAfter: newToBalance,
            description: description || `Transfer from ${fromAccount.name}`,
          },
          include: {
            account: {
              select: {
                id: true,
                accountNumber: true,
                name: true,
                currency: true,
              },
            },
          },
        });

        return {
          fromTransaction: debitTx,
          toTransaction: creditTx,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async getTransactionById(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        account: {
          select: {
            id: true,
            accountNumber: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new ApiError(404, "Transaction not found", "TRANSACTION_NOT_FOUND");
    }

    return transaction;
  }

  async listTransactions(query: ListTransactionsQuery) {
    const { accountId, type, limit, offset } = query;

    const where: Prisma.TransactionWhereInput = {};
    if (accountId) {
      where.accountId = accountId;
    }
    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          account: {
            select: {
              id: true,
              accountNumber: true,
              name: true,
              currency: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      limit,
      offset,
    };
  }
}

export const transactionService = new TransactionService();
