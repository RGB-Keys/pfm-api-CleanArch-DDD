import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { ExpenseNotFoundError } from '@/api/core/errors/domain/expense/expense-not-found-error'
import { NotAllowedError } from '@/api/core/errors/domain/not-allowed-error'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { EventBus } from '@/api/core/events/event-bus'
import { ClientRepository } from '../../repositories/client.repository'
import { ExpenseRepository } from '../../repositories/expense.repository'

export interface RemoveExpenseUseCaseRequest {
	clientId: string
	expenseId: string
}

export type RemoveExpenseUseCaseResponse = Either<
	ClientNotFoundError | ExpenseNotFoundError | NotAllowedError,
	void
>

export class RemoveExpenseUseCase {
	constructor(
		private readonly clientRepository: ClientRepository,
		private readonly expenseRepository: ExpenseRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute({
		clientId,
		expenseId,
	}: RemoveExpenseUseCaseRequest): Promise<RemoveExpenseUseCaseResponse> {
		const client = await this.clientRepository.findUnique({ clientId })
		if (!client) return fail(new ClientNotFoundError())

		const expense = await this.expenseRepository.findUnique({ expenseId })
		if (!expense) return fail(new ExpenseNotFoundError())

		if (!expense.clientId.equals(client.id!)) return fail(new NotAllowedError())

		client.removeExpense(expense)

		this.eventBus.dispatchEventsForAggregate(client.id as UniqueEntityId)
		await this.clientRepository.save(client)
		return success(undefined)
	}
}
