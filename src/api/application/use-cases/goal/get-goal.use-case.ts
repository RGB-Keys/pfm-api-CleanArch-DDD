import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { GoalNotFoundError } from '@/api/core/errors/domain/goal/goal-not-found-error'
import { NotAllowedError } from '@/api/core/errors/domain/not-allowed-error'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { Goal } from '@/api/domain/entities/goal.entity'
import { ClientRepository } from '../../repositories/client.repository'
import { GoalRepository } from '../../repositories/goal.repository'

interface GetGoalUseCaseRequest {
	clientId: string
	goalId: string
}

type GetGoalUseCaseResponse = Either<
	ClientNotFoundError | GoalNotFoundError | NotAllowedError,
	{
		goal: Goal
	}
>

export class GetGoalUseCase {
	constructor(
		private readonly clientRepository: ClientRepository,
		private readonly goalRepository: GoalRepository,
	) {}

	async execute({
		clientId,
		goalId,
	}: GetGoalUseCaseRequest): Promise<GetGoalUseCaseResponse> {
		const client = await this.clientRepository.findUnique({ clientId })
		if (!client) return fail(new ClientNotFoundError())

		const goal = await this.goalRepository.findUnique({ goalId })
		if (!goal) return fail(new GoalNotFoundError())

		if (!goal.clientId.equals(client.id!)) return fail(new NotAllowedError())

		return success({ goal })
	}
}
