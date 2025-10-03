import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { IncomeNotFoundError } from '@/api/core/errors/domain/income/income-not-found-error'
import { NotAllowedError } from '@/api/core/errors/domain/not-allowed-error'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { Income } from '@/api/domain/entities/income.entity'
import { ClientRepository } from '../../repositories/client.repository'
import { IncomeRepository } from '../../repositories/income.repository'

interface GetIncomeUseCaseRequest {
	clientId: string
	incomeId: string
}

type GetIncomeUseCaseResponse = Either<
	ClientNotFoundError | IncomeNotFoundError | NotAllowedError,
	{
		income: Income
	}
>

export class GetIncomeUseCase {
	constructor(
		private readonly clientRepository: ClientRepository,
		private readonly incomeRepository: IncomeRepository,
	) {}

	async execute({
		clientId,
		incomeId,
	}: GetIncomeUseCaseRequest): Promise<GetIncomeUseCaseResponse> {
		const client = await this.clientRepository.findUnique({ clientId })
		if (!client) return fail(new ClientNotFoundError())

		const income = await this.incomeRepository.findUnique({ incomeId })
		if (!income) return fail(new IncomeNotFoundError())

		if (!income.clientId.equals(client.id!)) return fail(new NotAllowedError())

		return success({ income })
	}
}
