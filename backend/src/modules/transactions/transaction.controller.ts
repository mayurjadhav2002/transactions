import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/handlers/async-handler";
import { transactionService } from "./transaction.service";
import {
  createTransactionSchema,
  getTransactionByIdSchema,
  listTransactionsQuerySchema,
} from "./transaction.schema";

export const createTransactionHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedBody = createTransactionSchema.parse(req.body);
    const transaction = await transactionService.createTransaction(validatedBody);

    res.status(201).json({
      success: true,
      data: transaction,
    });
  },
);

export const getTransactionByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = getTransactionByIdSchema.parse(req.params);
    const transaction = await transactionService.getTransactionById(id);

    res.status(200).json({
      success: true,
      data: transaction,
    });
  },
);

export const listTransactionsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedQuery = listTransactionsQuerySchema.parse(req.query);
    const result = await transactionService.listTransactions(validatedQuery);

    res.status(200).json({
      success: true,
      data: result.transactions,
      meta: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    });
  },
);
