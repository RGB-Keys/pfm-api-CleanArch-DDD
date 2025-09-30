import { Expense } from '@/api/domain/entities/expense.entity'

export abstract class ExpenseRepository {
	abstract create(expense: Expense): Promise<void>
	abstract findUnique(params: FindUniqueExpenseParams): Promise<Expense | null>
	abstract save(expense: Expense): Promise<void>
	abstract remove(expense: Expense): Promise<void>
}

export interface FindUniqueExpenseParams {
	expenseId?: string
}
