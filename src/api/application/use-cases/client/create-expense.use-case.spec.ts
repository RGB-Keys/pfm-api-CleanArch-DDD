import { CreateExpenseUseCase } from './create-expense.use-case'
import { Expense } from '@/api/domain/entities/expense.entity'
import { Client } from '@/api/domain/entities/client.entity'
import { InMemoryClientRepository } from '@/shared/tests/in-memory/in-memory-client.repository'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'

describe('Create Expense Use Case', () => {
	let clientRepository: InMemoryClientRepository
	let sut: CreateExpenseUseCase

	beforeEach(() => {
		clientRepository = new InMemoryClientRepository()
		sut = new CreateExpenseUseCase(clientRepository)
	})

	it('should be able to create a new expense', async () => {
		const client = await mockClient()

		const request = {
			clientId: client.id.toString(),
			amount: 100,
			category: 'Olx',
			date: new Date('2025-08-20'),
			description: 'Vendi um livro',
		}

		const result = await sut.execute(request)

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { expense } = result.value
			expect(expense).toBeInstanceOf(Expense)
			expect(expense).toMatchObject({
				clientId: client.expenses[0].clientId,
				amount: client.expenses[0].amount,
				category: client.expenses[0].category,
				date: client.expenses[0].date,
				description: client.expenses[0].description,
			})
		}
	})

	it('should not be able to create a expense if client not exists', async () => {
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
			monthlyIncome: new Money(5000),
		})

		await clientRepository.create(client)

		return client
	}
})
