import { Router } from "express";
import {
  createAccountHandler,
  getAccountByIdHandler,
  listAccountsHandler,
} from "./account.controller";

const router = Router();

router.post("/", createAccountHandler);
router.get("/", listAccountsHandler);
router.get("/:id", getAccountByIdHandler);

export default router;
export { router as accountRouter };
