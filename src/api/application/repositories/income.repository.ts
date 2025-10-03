import { OutputCollectionDTO } from '@/api/core/dtos/output-collection-dto'
import { SearchParams } from '@/api/core/search/search-params'
import { Income } from '@/api/domain/entities/income.entity'
import { ExpenseSummaryDTO } from '../dtos/expense.dto'

export abstract class IncomeRepository {
	abstract findUnique(params: FindUniqueIncomeParams): Promise<Income | null>
	abstract listSummary(
		params?: SearchParams<ExpenseSearchableFields>,
	): Promise<OutputCollectionDTO<ExpenseSummaryDTO>>
}

export interface FindUniqueIncomeParams {
	incomeId?: string
}

export interface ExpenseSearchableFields {
	clientId: string
	amount: number
	date: Date
	description?: string | null
	category?: string | null
}
