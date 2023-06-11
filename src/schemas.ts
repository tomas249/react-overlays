import { z } from 'zod';

export const IdSchema = z.object({
  id: z.string(),
});

export const AccountSchema = z.object({
  name: z.string(),
  balance: z.number(),
  currency: z.string(),
});

export const AccountWithIdSchema = AccountSchema.merge(IdSchema);

export const AccountsWithIdSchema = z.array(AccountWithIdSchema)

export const AccountsWithIdByIdSchema = z.record(AccountWithIdSchema);

export const TransactionSchema = z.object({
  createdAt: z.string(),
  accountId: z.string(),
  amount: z.number(),
  description: z.string(),
  tags: z.array(z.string()),
});

export const TransactionWithIdSchema = TransactionSchema.merge(IdSchema);

export const TransactionsWithIdSchema = z.array(TransactionWithIdSchema)

export const BillSchema = z.object({
  accountId: z.string(),
  amount: z.number(),
  description: z.string(),
  tags: z.array(z.string()),
  dayOfMonth: z.number(),
});

export const BillWithIdSchema = BillSchema.merge(IdSchema);

export const BillsWithIdSchema = z.array(BillWithIdSchema)