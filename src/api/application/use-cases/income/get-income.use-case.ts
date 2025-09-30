import { IncomeNotFoundError } from '@/api/core/errors/domain/income/income-not-found-error'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { Income } from '@/api/domain/entities/income.entity'
import { IncomeRepository } from '../../repositories/income.repository'

interface GetIncomeUseCaseRequest {
	incomeId: string
}

type GetIncomeUseCaseResponse = Either<
	IncomeNotFoundError,
	{
		income: Income
	}
>

export class GetIncomeUseCase {
	constructor(private incomeRepository: IncomeRepository) {}

	async execute({
		incomeId,
	}: GetIncomeUseCaseRequest): Promise<GetIncomeUseCaseResponse> {
		const income = await this.incomeRepository.findUnique({ incomeId })

		if (!income) return fail(new IncomeNotFoundError())

		return success({ income })
	}
}
