import { OutputCollectionDTO } from '@/api/core/dtos/output-collection-dto'
import { Either, success } from '@/api/core/errors/either/either'
import { SearchParams } from '@/api/core/search/search-params'
import { ExpenseSummaryDTO } from '../../dtos/expense.dto'
import { ExpenseRepository } from '../../repositories/expense.repository'

export type ListExpenseUseCaseRequest = SearchParams<{
	clientId: string
	date: Date
	category?: string | null
}>

export type ListExpenseUseCaseResponse = Either<
	null,
	OutputCollectionDTO<ExpenseSummaryDTO>
>

export class ListExpenseUseCase {
	constructor(private readonly expenseRepository: ExpenseRepository) {}

	async execute(
		request: ListExpenseUseCaseRequest,
	): Promise<ListExpenseUseCaseResponse> {
		return success(await this.expenseRepository.listSummary(request))
	}
}
