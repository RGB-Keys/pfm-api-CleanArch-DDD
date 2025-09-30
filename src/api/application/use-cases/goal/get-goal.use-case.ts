import { GoalNotFoundError } from '@/api/core/errors/domain/goal/goal-not-found-error'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { Goal } from '@/api/domain/entities/goal.entity'
import { GoalRepository } from '../../repositories/goal.repository'

interface GetGoalUseCaseRequest {
	goalId: string
}

type GetGoalUseCaseResponse = Either<
	GoalNotFoundError,
	{
		goal: Goal
	}
>

export class GetGoalUseCase {
	constructor(private goalRepository: GoalRepository) {}

	async execute({
		goalId,
	}: GetGoalUseCaseRequest): Promise<GetGoalUseCaseResponse> {
		const goal = await this.goalRepository.findUnique({ goalId })

		if (!goal) return fail(new GoalNotFoundError())

		return success({ goal })
	}
}
