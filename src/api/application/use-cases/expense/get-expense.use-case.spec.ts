import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { ExpenseNotFoundError } from '@/api/core/errors/domain/expense/expense-not-found-error'
import { NotAllowedError } from '@/api/core/errors/domain/not-allowed-error'
import { EventBus } from '@/api/core/events/event-bus'
import { Client } from '@/api/domain/entities/client.entity'
import { Expense } from '@/api/domain/entities/expense.entity'
import { Category } from '@/api/domain/entities/value-objects/category.value-object'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { ClientRepository } from '../../repositories/client.repository'
import { ExpenseRepository } from '../../repositories/expense.repository'
import { GetExpenseUseCase } from './get-expense.use-case'

describe('Get Expense Use Case', async () => {
	let clientRepository: ClientRepository
	let expenseRepository: ExpenseRepository
	let eventBus: EventBus
	let sut: GetExpenseUseCase

	beforeEach(() => {
		clientRepository = {
			create: vi.fn(),
			findUnique: vi.fn(),
			save: vi.fn(),
		} as unknown as ClientRepository

		expenseRepository = {
			findUnique: vi.fn(),
		} as unknown as ExpenseRepository

		eventBus = {
			markAggregateForDispatch: vi.fn(),
			dispatchEventsForAggregate: vi.fn(),
		}

		sut = new GetExpenseUseCase(clientRepository, expenseRepository)
	})

	it('should be able to get a expense', async () => {
		const { client, expense } = await mockExpense()

		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(client)
		vi.spyOn(expenseRepository, 'findUnique').mockResolvedValueOnce(expense)

		const result = await sut.execute({
			expenseId: expense.id.toString(),
			clientId: client.id.toString(),
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(result.value.expense).toEqual(expense)
		}
	})

	it('should not be able to get a expense if client doesnt exist', async () => {
		const { expense } = await mockExpense()

		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(null)
		vi.spyOn(expenseRepository, 'findUnique').mockResolvedValueOnce(expense)

		const result = await sut.execute({
			clientId: 'wrong-id',
			expenseId: expense.id.toString(),
		})

		expect(result.isFail()).toBe(true)
		expect(result.value).toBeInstanceOf(ClientNotFoundError)
	})

	it('should not be able to get a expense if expense doesnt exist', async () => {
		const { client } = await mockExpense()

		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(client)
		vi.spyOn(expenseRepository, 'findUnique').mockResolvedValueOnce(null)

		const result = await sut.execute({
			clientId: client.id.toString(),
			expenseId: 'wrong-id',
		})

		expect(result.isFail()).toBe(true)
		expect(result.value).toBeInstanceOf(ExpenseNotFoundError)
	})

	it('should return NotAllowedError if client is not the expense owner', async () => {
		const { otherClient, expense } = await mockExpense()

		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(otherClient)
		vi.spyOn(expenseRepository, 'findUnique').mockResolvedValueOnce(expense)

		const result = await sut.execute({
			clientId: otherClient.id.toString(),
			expenseId: expense.id.toString(),
		})

		expect(result.isFail()).toBe(true)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	const mockExpense = async () => {
		const client = Client.create({
			email: 'teste@gmail.com',
			name: 'testualdo',
			passwordHash: 'some_password',
		})

		const otherClient = Client.create({
			email: 'teste01@gmail.com',
			name: 'testualdo01',
			passwordHash: 'some_password',
		})

		await clientRepository.create(client)
		await clientRepository.create(otherClient)

		const expense = Expense.create({
			clientId: new UniqueEntityId(client.id.toString()),
			amount: new Money(100),
			category: new Category('Mercadinho'),
			date: new Date('2025-08-20'),
			description: 'Compras de casa',
		})

		client.setMonthlyIncome(new Money(5000))
		client.addExpense(expense)

		eventBus.dispatchEventsForAggregate(client.id as UniqueEntityId)
		await clientRepository.save(client)

		return { client, otherClient, expense }
	}
})
