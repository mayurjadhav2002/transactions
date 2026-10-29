import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/api-errors";
import { Prisma } from "@/generated/prisma/client";
import type {
  CreateTransactionInput,
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
