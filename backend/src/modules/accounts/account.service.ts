import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/api-errors";
import { Prisma } from "@/generated/prisma/client";
import type { CreateAccountInput, ListAccountsQuery } from "./account.schema";
import { generateAccountNumber } from "@/utils/generate-acc-no";

export class AccountService {
  async createAccount(input: CreateAccountInput) {
    const accountNumber = await generateAccountNumber();

    const existingAccount = await prisma.account.findUnique({
      where: { accountNumber },
    });

    if (existingAccount) {
      throw new ApiError(
        409,
        `Account with account number '${accountNumber}' already exists`,
        "ACCOUNT_ALREADY_EXISTS",
      );
    }

    const initialBalance = new Prisma.Decimal(input.initialBalance ?? 0);

    return prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: {
          name: input.name,
          accountNumber,
          currency: input.currency.toUpperCase(),
          balance: initialBalance,
        },
      });

      if (initialBalance.gt(0)) {
        await tx.transaction.create({
          data: {
            accountId: account.id,
            referenceId: `DEP-${Date.now().toString().slice(-6)}`,
            type: "CREDIT",
            amount: initialBalance,
            balanceAfter: initialBalance,
            description: "Initial Deposit",
          },
        });
      }

      return account;
    });
  }

  async getAccountById(id: string) {
    const account = await prisma.account.findUnique({ where: { id } });

    if (!account) {
      throw new ApiError(404, "Account not found", "ACCOUNT_NOT_FOUND");
    }

    return account;
  }

  async getAccountByNumber(accountNumber: string) {
    const account = await prisma.account.findUnique({
      where: { accountNumber },
    });

    if (!account) {
      throw new ApiError(404, "Account not found", "ACCOUNT_NOT_FOUND");
    }

    return account;
  }

  async listAccounts(query: ListAccountsQuery) {
    const { limit, offset, search } = query;

    const where: Prisma.AccountWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { accountNumber: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { transactions: true },
          },
        },
      }),
      prisma.account.count({ where }),
    ]);

    return {
      accounts,
      total,
      limit,
      offset,
    };
  }
}

export const accountService = new AccountService();
