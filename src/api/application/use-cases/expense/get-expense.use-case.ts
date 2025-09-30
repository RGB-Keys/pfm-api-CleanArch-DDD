import { ExpenseNotFoundError } from '@/api/core/errors/domain/expense/expense-not-found-error'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { Expense } from '@/api/domain/entities/expense.entity'
import { ExpenseRepository } from '../../repositories/expense.repository'

interface GetExpenseUseCaseRequest {
	expenseId: string
}

type GetExpenseUseCaseResponse = Either<
	ExpenseNotFoundError,
	{
		expense: Expense
	}
>

export class GetExpenseUseCase {
	constructor(private expenseRepository: ExpenseRepository) {}

	async execute({
		expenseId,
	}: GetExpenseUseCaseRequest): Promise<GetExpenseUseCaseResponse> {
		const expense = await this.expenseRepository.findUnique({ expenseId })

		if (!expense) return fail(new ExpenseNotFoundError())

		return success({ expense })
	}
}
