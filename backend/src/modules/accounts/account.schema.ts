import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().trim().min(1, "Account holder name is required"),
  initialBalance: z.coerce
    .number()
    .nonnegative("Initial balance cannot be negative")
    .default(0),
  currency: z
    .string()
    .trim()
    .length(3, "Currency code must be 3 characters")
    .default("INR"),
});

export const getAccountByIdSchema = z.object({
  id: z.string().uuid("Invalid account ID format (expected UUID)"),
});

export const getAccountByNumberSchema = z.object({
  accountNumber: z.string().trim().min(1, "Account number is required"),
});

export const listAccountsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().trim().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type ListAccountsQuery = z.infer<typeof listAccountsQuerySchema>;
