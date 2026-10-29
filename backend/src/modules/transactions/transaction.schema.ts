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

const optionalDateQuery = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val === "" ? undefined : val));

const optionalStringQuery = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val === "" ? undefined : val));

export const listTransactionsQuerySchema = z.object({
  accountId: z.preprocess((val) => {
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed === "" || trimmed === "all") return undefined;
      return trimmed;
    }
    return val;
  }, z.string().uuid().optional()),
  type: z.preprocess((val) => {
    if (typeof val === "string") {
      const upper = val.toUpperCase().trim();
      if (upper === "" || upper === "ALL") return undefined;
      return upper;
    }
    return val;
  }, TransactionTypeEnum.optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).optional(),
  skip: z.coerce.number().int().min(0).optional(),
  search: optionalStringQuery,
  q: optionalStringQuery,
  startDate: optionalDateQuery,
  endDate: optionalDateQuery,
  fromDate: optionalDateQuery,
  toDate: optionalDateQuery,
});

export const transferFundsSchema = z
  .object({
    fromAccountId: z
      .string()
      .uuid("Invalid source account ID format (expected UUID)"),
    toAccountId: z
      .string()
      .uuid("Invalid destination account ID format (expected UUID)"),
    amount: z.coerce
      .number()
      .positive("Transfer amount must be strictly greater than 0"),
    referenceId: z.string().trim().min(1, "Reference ID is required"),
    description: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "Source and destination accounts must be different",
    path: ["toAccountId"],
  });

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type TransferFundsInput = z.infer<typeof transferFundsSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;

