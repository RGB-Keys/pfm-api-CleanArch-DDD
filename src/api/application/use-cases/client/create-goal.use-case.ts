import { Goal } from '@/api/domain/entities/goal.entity'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { ClientRepository } from '../../repositories/client.repository'
import { EventBus } from '@/api/core/events/event-bus'

interface CreateGoalUseCaseRequest {
	clientId: string
	target: number
	endedAt?: Date | null
	saved: number
}

type CreateGoalUseCaseResponse = Either<
	ClientNotFoundError,
	{
		goal: Goal
	}
>

export class CreateGoalUseCase {
	constructor(
		private readonly clientRepository: ClientRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute({
		clientId,
		saved,
		target,
		endedAt,
	}: CreateGoalUseCaseRequest): Promise<CreateGoalUseCaseResponse> {
		const client = await this.clientRepository.findUnique({ clientId })

		if (!client) return fail(new ClientNotFoundError())

		const goal = Goal.create({
			clientId: new UniqueEntityId(clientId),
			saved: new Money(saved),
			target: new Money(target),
			endedAt,
		})

		client.addGoal(goal)
		this.eventBus.dispatchEventsForAggregate(client.id as UniqueEntityId)
		await this.clientRepository.save(client)

		return success({ goal })
	}
}
