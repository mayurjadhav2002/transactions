import { Router } from "express";
import {
  createTransactionHandler,
  getTransactionByIdHandler,
  listTransactionsHandler,
} from "./transaction.controller";

const router = Router();

router.post("/", createTransactionHandler);
router.get("/", listTransactionsHandler);
router.get("/:id", getTransactionByIdHandler);

export default router;
export { router as transactionRouter };
