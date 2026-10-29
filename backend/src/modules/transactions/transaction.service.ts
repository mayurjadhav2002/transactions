import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/api-errors";
import { Prisma } from "@/generated/prisma/client";
import type {
  CreateTransactionInput,
  TransferFundsInput,
  ListTransactionsQuery,
} from "./transaction.schema";

export function parseDateParam(
  dateStr?: string,
  isEndOfDay = false,
): Date | undefined {
  if (!dateStr || !dateStr.trim()) return undefined;
  const trimmed = dateStr.trim();

  // Match DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const month = parseInt(ddmmyyyyMatch[2], 10) - 1;
    const year = parseInt(ddmmyyyyMatch[3], 10);
    return isEndOfDay
      ? new Date(Date.UTC(year, month, day, 23, 59, 59, 999))
      : new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  }

  // Match YYYY-MM-DD
  const yyyymmddMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (yyyymmddMatch) {
    const year = parseInt(yyyymmddMatch[1], 10);
    const month = parseInt(yyyymmddMatch[2], 10) - 1;
    const day = parseInt(yyyymmddMatch[3], 10);
    return isEndOfDay
      ? new Date(Date.UTC(year, month, day, 23, 59, 59, 999))
      : new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    if (isEndOfDay && !trimmed.includes("T") && !trimmed.includes(":")) {
      parsed.setUTCHours(23, 59, 59, 999);
    }
    return parsed;
  }

  return undefined;
}

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
    const {
      accountId,
      type,
      page = 1,
      limit = 10,
      offset,
      skip,
      search,
      q,
      startDate,
      endDate,
      fromDate,
      toDate,
    } = query;

    const effectiveLimit = Math.min(Math.max(limit, 1), 100);
    const effectiveSkip =
      skip !== undefined
        ? skip
        : offset !== undefined
          ? offset
          : (page - 1) * effectiveLimit;
    const effectivePage = Math.floor(effectiveSkip / effectiveLimit) + 1;

    const where: Prisma.TransactionWhereInput = {};
    if (accountId) {
      where.accountId = accountId;
    }
    if (type) {
      where.type = type;
    }

    const searchQuery = search || q;
    if (searchQuery && searchQuery.trim()) {
      const queryStr = searchQuery.trim();
      where.OR = [
        { description: { contains: queryStr, mode: "insensitive" } },
        { referenceId: { contains: queryStr, mode: "insensitive" } },
        { account: { name: { contains: queryStr, mode: "insensitive" } } },
        { account: { accountNumber: { contains: queryStr, mode: "insensitive" } } },
      ];
    }

    const effectiveStartDate = parseDateParam(startDate || fromDate, false);
    const effectiveEndDate = parseDateParam(endDate || toDate, true);

    if (effectiveStartDate || effectiveEndDate) {
      const createdAtFilter: Prisma.DateTimeFilter = {};
      if (effectiveStartDate) {
        createdAtFilter.gte = effectiveStartDate;
      }
      if (effectiveEndDate) {
        createdAtFilter.lte = effectiveEndDate;
      }
      where.createdAt = createdAtFilter;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        take: effectiveLimit,
        skip: effectiveSkip,
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

    const totalPages = Math.max(1, Math.ceil(total / effectiveLimit));
    const hasNextPage = effectivePage < totalPages;
    const hasPrevPage = effectivePage > 1;

    return {
      transactions,
      meta: {
        total,
        page: effectivePage,
        limit: effectiveLimit,
        skip: effectiveSkip,
        offset: effectiveSkip,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }
}

export const transactionService = new TransactionService();
