import { OutputCollectionDTO } from '@/api/core/dtos/output-collection-dto'
import { Either, success } from '@/api/core/errors/either/either'
import { SearchParams } from '@/api/core/search/search-params'
import { GoalSummaryDTO } from '../../dtos/goal.dto'
import { GoalRepository } from '../../repositories/goal.repository'

export type ListGoalUseCaseRequest = SearchParams<{
	clientId: string
	target: number
	startedAt: Date
	endedAt?: Date | null
	saved: number
}>

export type ListGoalUseCaseResponse = Either<
	null,
	OutputCollectionDTO<GoalSummaryDTO>
>

export class ListGoalUseCase {
	constructor(private readonly goalRepository: GoalRepository) {}

	async execute(
		request: ListGoalUseCaseRequest,
	): Promise<ListGoalUseCaseResponse> {
		return success(await this.goalRepository.listSummary(request))
	}
}
