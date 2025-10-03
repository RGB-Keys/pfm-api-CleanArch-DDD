import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { GoalNotFoundError } from '@/api/core/errors/domain/goal/goal-not-found-error'
import { NotAllowedError } from '@/api/core/errors/domain/not-allowed-error'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { EventBus } from '@/api/core/events/event-bus'
import { ClientRepository } from '../../repositories/client.repository'
import { GoalRepository } from '../../repositories/goal.repository'

export interface RemoveGoalUseCaseRequest {
	clientId: string
	goalId: string
}

export type RemoveGoalUseCaseResponse = Either<
	ClientNotFoundError | GoalNotFoundError | NotAllowedError,
	void
>

export class RemoveGoalUseCase {
	constructor(
		private readonly clientRepository: ClientRepository,
		private readonly goalRepository: GoalRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute({
		clientId,
		goalId,
	}: RemoveGoalUseCaseRequest): Promise<RemoveGoalUseCaseResponse> {
		const client = await this.clientRepository.findUnique({ clientId })
		if (!client) return fail(new ClientNotFoundError())

		const goal = await this.goalRepository.findUnique({ goalId })
		if (!goal) return fail(new GoalNotFoundError())

		if (!goal.clientId.equals(client.id!)) return fail(new NotAllowedError())

		client.removeGoal(goal)

		this.eventBus.dispatchEventsForAggregate(client.id as UniqueEntityId)
		await this.clientRepository.save(client)
		return success(undefined)
	}
}
