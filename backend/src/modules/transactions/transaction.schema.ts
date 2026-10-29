import { z } from "zod";

export const TransactionTypeEnum = z.enum(["CREDIT", "DEBIT"]);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

export const createTransactionSchema = z.object({
  accountId: z.string().uuid("Invalid account ID format (expected UUID)"),
  referenceId: z
    .string()
    .trim()
    .min(1, "Reference ID is required"),
  type: TransactionTypeEnum,
  amount: z.coerce
    .number()
    .positive("Transaction amount must be strictly greater than 0"),
  description: z.string().trim().max(500).optional(),
});

export const getTransactionByIdSchema = z.object({
  id: z.string().uuid("Invalid transaction ID format (expected UUID)"),
});

export const listTransactionsQuerySchema = z.object({
  accountId: z.string().uuid().optional(),
  type: TransactionTypeEnum.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
