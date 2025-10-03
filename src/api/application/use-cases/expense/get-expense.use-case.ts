import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { ExpenseNotFoundError } from '@/api/core/errors/domain/expense/expense-not-found-error'
import { NotAllowedError } from '@/api/core/errors/domain/not-allowed-error'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { Expense } from '@/api/domain/entities/expense.entity'
import { ClientRepository } from '../../repositories/client.repository'
import { ExpenseRepository } from '../../repositories/expense.repository'

interface GetExpenseUseCaseRequest {
	clientId: string
	expenseId: string
}

type GetExpenseUseCaseResponse = Either<
	ClientNotFoundError | ExpenseNotFoundError | NotAllowedError,
	{
		expense: Expense
	}
>

export class GetExpenseUseCase {
	constructor(
		private readonly clientRepository: ClientRepository,
		private readonly expenseRepository: ExpenseRepository,
	) {}

	async execute({
		clientId,
		expenseId,
	}: GetExpenseUseCaseRequest): Promise<GetExpenseUseCaseResponse> {
		const client = await this.clientRepository.findUnique({ clientId })
		if (!client) return fail(new ClientNotFoundError())

		const expense = await this.expenseRepository.findUnique({ expenseId })
		if (!expense) return fail(new ExpenseNotFoundError())

		if (!expense.clientId.equals(client.id!)) return fail(new NotAllowedError())

		return success({ expense })
	}
}
