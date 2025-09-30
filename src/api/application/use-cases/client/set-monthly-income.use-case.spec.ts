import { Client } from '@/api/domain/entities/client.entity'
import { InMemoryClientRepository } from '@/shared/tests/in-memory/in-memory-client.repository'
import { SetMonthlyIncomeUseCase } from './set-monthly-income.use-case'
import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'

describe('Set Monthly Income Use Case', () => {
	let clientRepository: InMemoryClientRepository
	let sut: SetMonthlyIncomeUseCase

	beforeEach(() => {
		clientRepository = new InMemoryClientRepository()
		sut = new SetMonthlyIncomeUseCase(clientRepository)
	})

	it('should be able to set monthly income', async () => {
		const client = await mockClient()

		const request = {
			clientId: client.id.toString(),
			amount: 1000,
		}

		const result = await sut.execute(request)

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { clientId, monthlyIncome } = result.value
			expect(clientId).toEqual(request.clientId)
			expect(monthlyIncome).toEqual('R$ 1.000,00')
		}
	})

	it('should not be able to set monthly income if client not exists', async () => {
		const request = {
			clientId: 'wrong-id',
			amount: 1000,
		}

		const result = await sut.execute(request)

		expect(result.isFail()).toBe(true)
		expect(result.value).toBeInstanceOf(ClientNotFoundError)
	})

	const mockClient = async () => {
		const client = Client.create({
			email: 'teste@gmail.com',
			name: 'testualdo',
			passwordHash: 'some_password',
		})

		await clientRepository.create(client)

		return client
	}
})
