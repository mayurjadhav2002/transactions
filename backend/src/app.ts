import express from "express";
import cors from "cors";

import { notFoundHandler } from "@/middleware/handlers/not-found.middleware";
import { errorHandler } from "@/middleware/handlers/error.middleware";
import { accountRouter } from "@/modules/accounts/account.routes";
import { transactionRouter } from "@/modules/transactions/transaction.routes";
import helmet from "helmet";
import { CONSTANTS } from "./config/constants";

const app = express();

app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());

// api
app.use(`${CONSTANTS.API_VERSION}/accounts`, accountRouter);
app.use(`${CONSTANTS.API_VERSION}/transactions`, transactionRouter);

// non-existing routes
app.use(notFoundHandler);

// central error handler
app.use(errorHandler);

export default app;
