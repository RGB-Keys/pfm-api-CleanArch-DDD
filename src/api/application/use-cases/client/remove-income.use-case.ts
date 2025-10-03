import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { IncomeNotFoundError } from '@/api/core/errors/domain/income/income-not-found-error'
import { NotAllowedError } from '@/api/core/errors/domain/not-allowed-error'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { EventBus } from '@/api/core/events/event-bus'
import { ClientRepository } from '../../repositories/client.repository'
import { IncomeRepository } from '../../repositories/income.repository'

export interface RemoveIncomeUseCaseRequest {
	clientId: string
	incomeId: string
}

export type RemoveIncomeUseCaseResponse = Either<
	ClientNotFoundError | IncomeNotFoundError | NotAllowedError,
	void
>

export class RemoveIncomeUseCase {
	constructor(
		private readonly clientRepository: ClientRepository,
		private readonly incomeRepository: IncomeRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute({
		clientId,
		incomeId,
	}: RemoveIncomeUseCaseRequest): Promise<RemoveIncomeUseCaseResponse> {
		const client = await this.clientRepository.findUnique({ clientId })
		if (!client) return fail(new ClientNotFoundError())

		const income = await this.incomeRepository.findUnique({ incomeId })
		if (!income) return fail(new IncomeNotFoundError())

		if (!income.clientId.equals(client.id!)) return fail(new NotAllowedError())

		client.removeIncome(income)

		this.eventBus.dispatchEventsForAggregate(client.id as UniqueEntityId)
		await this.clientRepository.save(client)
		return success(undefined)
	}
}
