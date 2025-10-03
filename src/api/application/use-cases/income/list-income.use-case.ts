import { OutputCollectionDTO } from '@/api/core/dtos/output-collection-dto'
import { Either, success } from '@/api/core/errors/either/either'
import { SearchParams } from '@/api/core/search/search-params'
import { IncomeSummaryDTO } from '../../dtos/income.dto'
import { IncomeRepository } from '../../repositories/income.repository'

export type ListIncomeUseCaseRequest = SearchParams<{
	clientId: string
	date: Date
	category?: string | null
}>

export type ListIncomeUseCaseResponse = Either<
	null,
	OutputCollectionDTO<IncomeSummaryDTO>
>

export class ListIncomeUseCase {
	constructor(private readonly incomeRepository: IncomeRepository) {}

	async execute(
		request: ListIncomeUseCaseRequest,
	): Promise<ListIncomeUseCaseResponse> {
		return success(await this.incomeRepository.listSummary(request))
	}
}
