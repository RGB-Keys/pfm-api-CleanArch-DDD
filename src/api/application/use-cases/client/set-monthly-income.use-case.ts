import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { ClientRepository } from '../../repositories/client.repository'

interface SetMonthlyIncomeUseCaseRequest {
	clientId: string
	amount: number
}

type SetMonthlyIncomeUseCaseResponse = Either<
	ClientNotFoundError,
	{
		clientId: string
		monthlyIncome: string
	}
>

export class SetMonthlyIncomeUseCase {
	constructor(private readonly clientRepository: ClientRepository) {}

	async execute({
		clientId,
		amount,
	}: SetMonthlyIncomeUseCaseRequest): Promise<SetMonthlyIncomeUseCaseResponse> {
		const client = await this.clientRepository.findUnique({ clientId })

		if (!client) return fail(new ClientNotFoundError())

		client.setMonthlyIncome(new Money(amount))

		await this.clientRepository.save(client)

		return success({
			clientId: client.id.toString(),
			monthlyIncome: client.monthlyIncome?.formatted ?? '0.00',
		})
	}
}
