import { CreateIncomeUseCase } from './create-income.use-case'
import { Income } from '@/api/domain/entities/income.entity'
import { Client } from '@/api/domain/entities/client.entity'
import { InMemoryClientRepository } from '@/shared/tests/in-memory/in-memory-client.repository'
import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'

describe('Create Income Use Case', () => {
	let clientRepository: InMemoryClientRepository
	let sut: CreateIncomeUseCase

	beforeEach(() => {
		clientRepository = new InMemoryClientRepository()
		sut = new CreateIncomeUseCase(clientRepository)
	})

	it('should be able to create a new income', async () => {
		const client = await mockClient()

		const request = {
			clientId: client.id.toString(),
			amount: 100.0,
			category: 'Olx',
			date: new Date('2025-08-20'),
			description: 'Vendi um livro',
		}

		const result = await sut.execute(request)

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { income } = result.value
			expect(income).toBeInstanceOf(Income)
			expect(income).toMatchObject({
				clientId: client.incomes[0].clientId,
				amount: client.incomes[0].amount,
				category: client.incomes[0].category,
				date: client.incomes[0].date,
				description: client.incomes[0].description,
			})
		}
	})

	it('should not be able to create a income if client not exists', async () => {
		const request = {
			clientId: 'wrong-id',
			amount: 1000,
			category: 'Olx',
			date: new Date('2025-08-20'),
			description: 'Vendi um livro',
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
