import express from "express";
import cors from "cors";

import { notFoundHandler } from "@/middleware/handlers/not-found.middleware";
import { errorHandler } from "@/middleware/handlers/error.middleware";
import { accountRouter } from "@/modules/accounts/account.routes";
import { transactionRouter } from "@/modules/transactions/transaction.routes";
import helmet from "helmet";
import { CONSTANTS } from "@/config/constants";
import { corsOptions } from "@/utils/cors-origins";

const app = express();

app.use(cors(corsOptions));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());

app.get(["/health", `${CONSTANTS.API_VERSION}/health`], (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// api
app.use(`${CONSTANTS.API_VERSION}/accounts`, accountRouter);
app.use(`${CONSTANTS.API_VERSION}/transactions`, transactionRouter);

// non-existing routes
app.use(notFoundHandler);

// central error handler
app.use(errorHandler);

export default app;
