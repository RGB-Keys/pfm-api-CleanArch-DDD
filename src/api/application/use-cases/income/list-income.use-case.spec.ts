import { OutputCollectionDTO } from '@/api/core/dtos/output-collection-dto'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { EventBus } from '@/api/core/events/event-bus'
import { Client } from '@/api/domain/entities/client.entity'
import { Income } from '@/api/domain/entities/income.entity'
import { Category } from '@/api/domain/entities/value-objects/category.value-object'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { IncomeSummaryDTO } from '../../dtos/income.dto'
import { ClientRepository } from '../../repositories/client.repository'
import { IncomeRepository } from '../../repositories/income.repository'
import { ListIncomeUseCase } from './list-income.use-case'

describe('List Income Use Case', async () => {
	let clientRepository: ClientRepository
	let incomeRepository: IncomeRepository
	let eventBus: EventBus
	let sut: ListIncomeUseCase

	beforeEach(() => {
		clientRepository = {
			create: vi.fn(),
			findUnique: vi.fn(),
			save: vi.fn(),
		} as unknown as ClientRepository

		incomeRepository = {
			listSummary: vi.fn(),
		} as unknown as IncomeRepository

		eventBus = {
			markAggregateForDispatch: vi.fn(),
			dispatchEventsForAggregate: vi.fn(),
		}

		sut = new ListIncomeUseCase(incomeRepository)
	})

	it('should be able to list a income', async () => {
		const { client, mockResolved } = await mockIncome()

		const list = vi
			.spyOn(incomeRepository, 'listSummary')
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
			expect(data).toEqual(client.incomes.items)
		}
	})

	it('should be able to list a income with filter category', async () => {
		const { client, income01, mockResolved01 } = await mockIncome()

		const list = vi
			.spyOn(incomeRepository, 'listSummary')
			.mockResolvedValue(mockResolved01)

		const result = await sut.execute({
			filters: {
				clientId: client.id.toString(),
				category: income01.category?.toString(),
			},
			pagination: {
				page: 1,
				perPage: 10,
			},
		})

		expect(list).toHaveBeenCalledWith({
			filters: {
				clientId: client.id.toString(),
				category: income01.category?.toString(),
			},
			pagination: { page: 1, perPage: 10 },
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { data } = result.value
			expect(data).toHaveLength(1)
			expect(data[0]).toEqual(client.incomes.items[0])
		}
	})

	it('should be able to list a income with filter date', async () => {
		const { client, income01, mockResolved01 } = await mockIncome()

		const list = vi
			.spyOn(incomeRepository, 'listSummary')
			.mockResolvedValue(mockResolved01)

		const result = await sut.execute({
			filters: {
				clientId: client.id.toString(),
				date: income01.date,
			},
			pagination: {
				page: 1,
				perPage: 10,
			},
		})

		expect(list).toHaveBeenCalledWith({
			filters: { clientId: client.id.toString(), date: income01.date },
			pagination: { page: 1, perPage: 10 },
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { data } = result.value
			expect(data).toHaveLength(1)
			expect(data[0]).toEqual(client.incomes.items[0])
		}
	})

	const mockIncome = async () => {
		const client = Client.create({
			email: 'teste@gmail.com',
			name: 'testualdo',
			passwordHash: 'some_password',
			monthlyIncome: new Money(5000),
		})

		await clientRepository.create(client)

		const income01 = Income.create({
			clientId: new UniqueEntityId(client.id.toString()),
			amount: new Money(100),
			category: new Category('Mercadinho'),
			date: new Date('2025-08-21'),
			description: 'Compras de casa',
		})

		const income02 = Income.create({
			clientId: new UniqueEntityId(client.id.toString()),
			amount: new Money(700),
			category: new Category('Aluguel'),
			date: new Date('2025-08-20'),
			description: '',
		})

		client.addIncome(income01)
		client.addIncome(income02)

		eventBus.dispatchEventsForAggregate(client.id as UniqueEntityId)
		await clientRepository.save(client)

		const mockResolved: OutputCollectionDTO<IncomeSummaryDTO> = {
			data: [income01, income02],
			meta: {
				currentPage: 1,
				pageCount: 10,
				totalCount: 2,
				totalPages: 1,
			},
		}

		const mockResolved01: OutputCollectionDTO<IncomeSummaryDTO> = {
			data: [income01],
			meta: {
				currentPage: 1,
				pageCount: 10,
				totalCount: 2,
				totalPages: 1,
			},
		}

		return { client, income01, income02, mockResolved, mockResolved01 }
	}
})
