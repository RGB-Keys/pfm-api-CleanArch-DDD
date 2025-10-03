import { Expense } from '@/api/domain/entities/expense.entity'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { Category } from '@/api/domain/entities/value-objects/category.value-object'
import { ClientRepository } from '../../repositories/client.repository'
import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { EventBus } from '@/api/core/events/event-bus'

interface CreateExpenseUseCaseRequest {
	clientId: string
	amount: number
	date: Date
	description?: string
	category: string
}

type CreateExpenseUseCaseResponse = Either<
	ClientNotFoundError,
	{
		expense: Expense
	}
>

export class CreateExpenseUseCase {
	constructor(
		private readonly clientRepository: ClientRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute({
		clientId,
		amount,
		category,
		date,
		description,
	}: CreateExpenseUseCaseRequest): Promise<CreateExpenseUseCaseResponse> {
		const client = await this.clientRepository.findUnique({ clientId })

		if (!client) return fail(new ClientNotFoundError())

		const expense = Expense.create({
			clientId: new UniqueEntityId(client.id.toString()),
			amount: new Money(amount),
			category: new Category(category),
			date,
			description,
		})

		client.addExpense(expense)
		this.eventBus.dispatchEventsForAggregate(client.id as UniqueEntityId)
		await this.clientRepository.save(client)

		return success({ expense })
	}
}
