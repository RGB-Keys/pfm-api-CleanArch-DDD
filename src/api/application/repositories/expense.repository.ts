import { OutputCollectionDTO } from '@/api/core/dtos/output-collection-dto'
import { SearchParams } from '@/api/core/search/search-params'
import { Expense } from '@/api/domain/entities/expense.entity'
import { ExpenseSummaryDTO } from '../dtos/expense.dto'

export abstract class ExpenseRepository {
	abstract findUnique(params: FindUniqueExpenseParams): Promise<Expense | null>
	abstract listSummary(
		params?: SearchParams<ExpenseSearchableFields>,
	): Promise<OutputCollectionDTO<ExpenseSummaryDTO>>
}

export interface FindUniqueExpenseParams {
	expenseId?: string
}

export interface ExpenseSearchableFields {
	clientId: string
	amount: number
	date: Date
	description?: string | null
	category?: string | null
}
