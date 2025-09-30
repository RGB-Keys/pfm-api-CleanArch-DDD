import { ExpenseNotFoundError } from '@/api/core/errors/domain/expense/expense-not-found-error'
import { Expense } from '@/api/domain/entities/expense.entity'
import { InMemoryExpenseRepository } from '@/shared/tests/in-memory/in-memory-expense.repository'
import { GetExpenseUseCase } from './get-expense.use-case'
import { Client } from '@/api/domain/entities/client.entity'
import { InMemoryClientRepository } from '@/shared/tests/in-memory/in-memory-client.repository'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { Category } from '@/api/domain/entities/value-objects/category.value-object'
import { PersistExpenseOnAddedHandler } from '../../subscribers/expense/persist-expense-on-added.handler'
import { DomainEvents } from '@/api/core/events/domain-events'

describe('Get Expense Use Case', async () => {
	let clientRepository: InMemoryClientRepository
	let expenseRepository: InMemoryExpenseRepository
	let handler: PersistExpenseOnAddedHandler
	let sut: GetExpenseUseCase

	beforeEach(() => {
		clientRepository = new InMemoryClientRepository()
		expenseRepository = new InMemoryExpenseRepository()
		handler = new PersistExpenseOnAddedHandler(expenseRepository)
		sut = new GetExpenseUseCase(expenseRepository)

		handler.setupSubscriptions()
	})

	it('should be able to get a expense', async () => {
		const existingExpense = await mockExpense()

		const result = await sut.execute({
			expenseId: existingExpense.id.toString(),
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { expense } = result.value
			expect(expense).toEqual(existingExpense)
		}
	})

	it('should not be able to get a expense if doesnt exist', async () => {
		const result = await sut.execute({ expenseId: 'wrond-id' })

		expect(result.isFail()).toBe(true)
		expect(result.value).toBeInstanceOf(ExpenseNotFoundError)
	})

	const mockExpense = async () => {
		const client = Client.create({
			email: 'teste@gmail.com',
			name: 'testualdo',
			passwordHash: 'some_password',
			monthlyIncome: new Money(5000),
		})

		await clientRepository.create(client)

		const expense = Expense.create({
			clientId: new UniqueEntityId(client.id.toString()),
			amount: new Money(100),
			category: new Category('Mercadinho'),
			date: new Date('2025-08-20'),
			description: 'Compras de casa',
		})

		client.addExpense(expense)

		DomainEvents.dispatchEventsForAggregate(client.id as UniqueEntityId)
		await clientRepository.save(client)
		return expense
	}
})
