import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { Client } from '@/api/domain/entities/client.entity'
import { ClientRepository } from '../../repositories/client.repository'
import { SetMonthlyIncomeUseCase } from './set-monthly-income.use-case'

describe('Set Monthly Income Use Case', () => {
	let clientRepository: ClientRepository
	let sut: SetMonthlyIncomeUseCase

	beforeEach(() => {
		clientRepository = {
			create: vi.fn(),
			findUnique: vi.fn(),
			save: vi.fn(),
		} as unknown as ClientRepository

		sut = new SetMonthlyIncomeUseCase(clientRepository)
	})

	it('should be able to set monthly income', async () => {
		const client = await mockClient()

		const findClient = vi
			.spyOn(clientRepository, 'findUnique')
			.mockResolvedValueOnce(client)

		const savedClient = vi.spyOn(clientRepository, 'save').mockResolvedValue()

		const request = {
			clientId: client.id.toString(),
			amount: 1000,
		}

		const result = await sut.execute(request)

		expect(findClient).toHaveBeenCalledWith({
			clientId: client.id.toString(),
		})
		expect(savedClient).toHaveBeenCalledWith(client)

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { clientId, monthlyIncome } = result.value
			expect(clientId).toEqual(request.clientId)
			expect(monthlyIncome).toEqual('R$ 1.000,00')
		}
	})

	it('should not be able to set monthly income if client not exists', async () => {
		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(null)

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
