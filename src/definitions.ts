import { z } from 'zod';
import * as schemas from './schemas'

export type MapValuesToStr<T> = Record<keyof T, string>

export type Id = z.infer<typeof schemas.IdSchema>

export type Account = z.infer<typeof schemas.AccountSchema>
export type AccountWithId = z.infer<typeof schemas.AccountWithIdSchema>
export type AccountsWithId = z.infer<typeof schemas.AccountsWithIdSchema>
export type AccountsWithIdById = z.infer<typeof schemas.AccountsWithIdByIdSchema>

export type Transaction = z.infer<typeof schemas.TransactionSchema>
export type TransactionWithId = z.infer<typeof schemas.TransactionWithIdSchema>
export type TransactionsWithId = z.infer<typeof schemas.TransactionsWithIdSchema>

export type Bill = z.infer<typeof schemas.BillSchema>
export type BillWithId = z.infer<typeof schemas.BillWithIdSchema>
export type BillsWithId = z.infer<typeof schemas.BillsWithIdSchema>
