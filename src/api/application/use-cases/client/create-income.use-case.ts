import { Income } from '@/api/domain/entities/income.entity'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { Category } from '@/api/domain/entities/value-objects/category.value-object'
import { ClientRepository } from '../../repositories/client.repository'
import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { DomainEvents } from '@/api/core/events/domain-events'

interface CreateIncomeUseCaseRequest {
	clientId: string
	amount: number
	date: Date
	description?: string
	category: string
}

type CreateIncomeUseCaseResponse = Either<
	ClientNotFoundError,
	{
		income: Income
	}
>

export class CreateIncomeUseCase {
	constructor(private clientRepository: ClientRepository) {}

	async execute({
		clientId,
		amount,
		category,
		date,
		description,
	}: CreateIncomeUseCaseRequest): Promise<CreateIncomeUseCaseResponse> {
		const client = await this.clientRepository.findUnique({ clientId })

		if (!client) return fail(new ClientNotFoundError())

		const income = Income.create({
			clientId: new UniqueEntityId(clientId),
			amount: new Money(amount),
			category: new Category(category),
			date,
			description,
		})

		client.addIncome(income)
		DomainEvents.dispatchEventsForAggregate(client.id as UniqueEntityId)
		await this.clientRepository.save(client)

		return success({ income })
	}
}
