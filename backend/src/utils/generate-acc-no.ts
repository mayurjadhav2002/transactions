import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 10;

export const generateAccountNumber = async (): Promise<string> => {
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;

    const accountNumber = `ACC-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

    const existingAccount = await prisma.account.findUnique({
      where: { accountNumber },
      select: { id: true },
    });

    if (!existingAccount) {
      return accountNumber;
    }
  }

  throw new Error("Failed to generate a unique account number");
};
