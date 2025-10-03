import { OutputCollectionDTO } from '@/api/core/dtos/output-collection-dto'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { EventBus } from '@/api/core/events/event-bus'
import { Client } from '@/api/domain/entities/client.entity'
import { Expense } from '@/api/domain/entities/expense.entity'
import { Category } from '@/api/domain/entities/value-objects/category.value-object'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { ExpenseSummaryDTO } from '../../dtos/expense.dto'
import { ClientRepository } from '../../repositories/client.repository'
import { ExpenseRepository } from '../../repositories/expense.repository'
import { ListExpenseUseCase } from './list-expense.use-case'

describe('List Expense Use Case', async () => {
	let clientRepository: ClientRepository
	let expenseRepository: ExpenseRepository
	let eventBus: EventBus
	let sut: ListExpenseUseCase

	beforeEach(() => {
		clientRepository = {
			create: vi.fn(),
			findUnique: vi.fn(),
			save: vi.fn(),
		} as unknown as ClientRepository

		expenseRepository = {
			listSummary: vi.fn(),
		} as unknown as ExpenseRepository

		eventBus = {
			markAggregateForDispatch: vi.fn(),
			dispatchEventsForAggregate: vi.fn(),
		}

		sut = new ListExpenseUseCase(expenseRepository)
	})

	it('should be able to list a expense', async () => {
		const { client, mockResolved } = await mockExpense()

		const list = vi
			.spyOn(expenseRepository, 'listSummary')
			.mockResolvedValue(mockResolved)

		const result = await sut.execute({
			filters: {
				clientId: client.id.toString(),
			},
			pagination: {
				page: 1,
				perPage: 10,
			},
		})

		expect(list).toHaveBeenCalledWith({
			filters: { clientId: client.id.toString() },
			pagination: { page: 1, perPage: 10 },
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { data } = result.value
			expect(data).toHaveLength(2)
			expect(data).toEqual(client.expenses.items)
		}
	})

	it('should be able to list a expense with filter category', async () => {
		const { client, expense01, mockResolved01 } = await mockExpense()

		const list = vi
			.spyOn(expenseRepository, 'listSummary')
			.mockResolvedValue(mockResolved01)

		const result = await sut.execute({
			filters: {
				clientId: client.id.toString(),
				category: expense01.category?.toString(),
			},
			pagination: {
				page: 1,
				perPage: 10,
			},
		})

		expect(list).toHaveBeenCalledWith({
			filters: {
				clientId: client.id.toString(),
				category: expense01.category?.toString(),
			},
			pagination: { page: 1, perPage: 10 },
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { data } = result.value
			expect(data).toHaveLength(1)
			expect(data[0]).toEqual(client.expenses.items[0])
		}
	})

	it('should be able to list a expense with filter date', async () => {
		const { client, expense01, mockResolved01 } = await mockExpense()

		const list = vi
			.spyOn(expenseRepository, 'listSummary')
			.mockResolvedValue(mockResolved01)

		const result = await sut.execute({
			filters: {
				clientId: client.id.toString(),
				date: expense01.date,
			},
			pagination: {
				page: 1,
				perPage: 10,
			},
		})

		expect(list).toHaveBeenCalledWith({
			filters: { clientId: client.id.toString(), date: expense01.date },
			pagination: { page: 1, perPage: 10 },
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { data } = result.value
			expect(data).toHaveLength(1)
			expect(data[0]).toEqual(client.expenses.items[0])
		}
	})

	const mockExpense = async () => {
		const client = Client.create({
			email: 'teste@gmail.com',
			name: 'testualdo',
			passwordHash: 'some_password',
		})

		await clientRepository.create(client)

		const expense01 = Expense.create({
			clientId: new UniqueEntityId(client.id.toString()),
			amount: new Money(100),
			category: new Category('Mercadinho'),
			date: new Date('2025-08-21'),
			description: 'Compras de casa',
		})

		const expense02 = Expense.create({
			clientId: new UniqueEntityId(client.id.toString()),
			amount: new Money(700),
			category: new Category('Aluguel'),
			date: new Date('2025-08-20'),
			description: '',
		})

		client.setMonthlyIncome(new Money(5000))
		client.addExpense(expense01)
		client.addExpense(expense02)

		eventBus.dispatchEventsForAggregate(client.id as UniqueEntityId)
		await clientRepository.save(client)

		const mockResolved: OutputCollectionDTO<ExpenseSummaryDTO> = {
			data: [expense01, expense02],
			meta: {
				currentPage: 1,
				pageCount: 10,
				totalCount: 2,
				totalPages: 1,
			},
		}

		const mockResolved01: OutputCollectionDTO<ExpenseSummaryDTO> = {
			data: [expense01],
			meta: {
				currentPage: 1,
				pageCount: 10,
				totalCount: 2,
				totalPages: 1,
			},
		}

		return { client, expense01, expense02, mockResolved, mockResolved01 }
	}
})
