import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/handlers/async-handler";
import { accountService } from "./account.service";
import {
  createAccountSchema,
  getAccountByIdSchema,
  getAccountByNumberSchema,
  listAccountsQuerySchema,
} from "./account.schema";

export const getAccountByNumberHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { accountNumber } = getAccountByNumberSchema.parse(req.params);
    const account = await accountService.getAccountByNumber(accountNumber);

    res.status(200).json({
      success: true,
      data: account,
    });
  },
);

export const createAccountHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedBody = createAccountSchema.parse(req.body);
    const account = await accountService.createAccount(validatedBody);

    res.status(201).json({
      success: true,
      data: account,
    });
  },
);

export const getAccountByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = getAccountByIdSchema.parse(req.params);
    const account = await accountService.getAccountById(id);

    res.status(200).json({
      success: true,
      data: account,
    });
  },
);

export const listAccountsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedQuery = listAccountsQuerySchema.parse(req.query);
    const result = await accountService.listAccounts(validatedQuery);

    res.status(200).json({
      success: true,
      data: result.accounts,
      meta: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    });
  },
);
