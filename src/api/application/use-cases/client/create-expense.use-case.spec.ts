import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { EventBus } from '@/api/core/events/event-bus'
import { Client } from '@/api/domain/entities/client.entity'
import { Expense } from '@/api/domain/entities/expense.entity'
import { Category } from '@/api/domain/entities/value-objects/category.value-object'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { ClientRepository } from '../../repositories/client.repository'
import { CreateExpenseUseCase } from './create-expense.use-case'

describe('Create Expense Use Case', () => {
	let clientRepository: ClientRepository
	let eventBus: EventBus
	let sut: CreateExpenseUseCase

	beforeEach(() => {
		clientRepository = {
			create: vi.fn(),
			findUnique: vi.fn(),
			save: vi.fn(),
		} as unknown as ClientRepository

		eventBus = {
			markAggregateForDispatch: vi.fn(),
			dispatchEventsForAggregate: vi.fn(),
		}
		sut = new CreateExpenseUseCase(clientRepository, eventBus)
	})

	it('should be able to create a new expense', async () => {
		const { client } = await mockClient()

		const findClient = vi
			.spyOn(clientRepository, 'findUnique')
			.mockResolvedValueOnce(client)

		const savedClient = vi
			.spyOn(clientRepository, 'save')
			.mockResolvedValueOnce()

		const request = {
			clientId: client.id.toString(),
			amount: 100,
			category: 'Olx',
			date: new Date('2025-08-20'),
			description: 'Vendi um livro',
		}

		const result = await sut.execute(request)

		expect(savedClient).toHaveBeenCalledWith(client)
		expect(findClient).toHaveBeenCalledWith({ clientId: client.id.toString() })
		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { expense } = result.value
			expect(expense).toBeInstanceOf(Expense)
			expect(expense).toMatchObject({
				clientId: client.expenses.items[0].clientId,
				amount: client.expenses.items[0].amount,
				category: client.expenses.items[0].category,
				date: client.expenses.items[0].date,
				description: client.expenses.items[0].description,
			})
		}
	})

	it('should track new expenses in watched list', async () => {
		const { client } = await mockClient()

		const expense = Expense.create({
			clientId: client.id as UniqueEntityId,
			amount: new Money(100),
			category: new Category('Food'),
		})

		client.addExpense(expense)

		expect(client.expenses.newItems).toContain(expense)
		expect(client.expenses.items).toHaveLength(1)
	})

	it('should not be able to create a expense if client not exists', async () => {
		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(null)

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

		client.setMonthlyIncome(new Money(5000))
		await clientRepository.create(client)

		return { client }
	}
})
