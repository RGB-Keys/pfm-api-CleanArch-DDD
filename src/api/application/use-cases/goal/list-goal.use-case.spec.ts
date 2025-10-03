import { OutputCollectionDTO } from '@/api/core/dtos/output-collection-dto'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { EventBus } from '@/api/core/events/event-bus'
import { Client } from '@/api/domain/entities/client.entity'
import { Goal } from '@/api/domain/entities/goal.entity'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { GoalSummaryDTO } from '../../dtos/goal.dto'
import { ClientRepository } from '../../repositories/client.repository'
import { GoalRepository } from '../../repositories/goal.repository'
import { ListGoalUseCase } from './list-goal.use-case'

describe('List Goal Use Case', async () => {
	let clientRepository: ClientRepository
	let goalRepository: GoalRepository
	let eventBus: EventBus
	let sut: ListGoalUseCase

	beforeEach(() => {
		clientRepository = {
			create: vi.fn(),
			findUnique: vi.fn(),
			save: vi.fn(),
		} as unknown as ClientRepository

		goalRepository = {
			listSummary: vi.fn(),
		} as unknown as GoalRepository

		eventBus = {
			markAggregateForDispatch: vi.fn(),
			dispatchEventsForAggregate: vi.fn(),
		}

		sut = new ListGoalUseCase(goalRepository)
	})

	it('should be able to list a goal', async () => {
		const { client, mockResolved } = await mockGoal()

		const list = vi
			.spyOn(goalRepository, 'listSummary')
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
			expect(data).toEqual(client.goals.items)
		}
	})

	it('should be able to list a goal with filter target', async () => {
		const { client, goal01, mockResolved01 } = await mockGoal()

		const list = vi
			.spyOn(goalRepository, 'listSummary')
			.mockResolvedValue(mockResolved01)

		const result = await sut.execute({
			filters: {
				clientId: client.id.toString(),
				target: goal01.target.amount,
			},
			pagination: {
				page: 1,
				perPage: 10,
			},
		})

		expect(list).toHaveBeenCalledWith({
			filters: {
				clientId: client.id.toString(),
				target: goal01.target.amount,
			},
			pagination: { page: 1, perPage: 10 },
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { data } = result.value
			expect(data).toHaveLength(1)
			expect(data[0]).toEqual(client.goals.items[0])
		}
	})

	it('should be able to list a goal with filter startedAt', async () => {
		const { client, goal01, mockResolved01 } = await mockGoal()

		const list = vi
			.spyOn(goalRepository, 'listSummary')
			.mockResolvedValue(mockResolved01)

		const result = await sut.execute({
			filters: {
				clientId: client.id.toString(),
				startedAt: goal01.startedAt,
			},
			pagination: {
				page: 1,
				perPage: 10,
			},
		})

		expect(list).toHaveBeenCalledWith({
			filters: {
				clientId: client.id.toString(),
				startedAt: goal01.startedAt,
			},
			pagination: { page: 1, perPage: 10 },
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { data } = result.value
			expect(data).toHaveLength(1)
			expect(data[0]).toEqual(client.goals.items[0])
		}
	})

	it('should be able to list a goal with filter endedAt', async () => {
		const { client, goal01, mockResolved01 } = await mockGoal()

		const list = vi
			.spyOn(goalRepository, 'listSummary')
			.mockResolvedValue(mockResolved01)

		const result = await sut.execute({
			filters: {
				clientId: client.id.toString(),
				endedAt: goal01.endedAt,
			},
			pagination: {
				page: 1,
				perPage: 10,
			},
		})

		expect(list).toHaveBeenCalledWith({
			filters: {
				clientId: client.id.toString(),
				endedAt: goal01.endedAt,
			},
			pagination: { page: 1, perPage: 10 },
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { data } = result.value
			expect(data).toHaveLength(1)
			expect(data[0]).toEqual(client.goals.items[0])
		}
	})

	it('should be able to list a goal with filter saved', async () => {
		const { client, goal01, mockResolved01 } = await mockGoal()

		const list = vi
			.spyOn(goalRepository, 'listSummary')
			.mockResolvedValue(mockResolved01)

		const result = await sut.execute({
			filters: {
				clientId: client.id.toString(),
				saved: goal01.saved.amount,
			},
			pagination: {
				page: 1,
				perPage: 10,
			},
		})

		expect(list).toHaveBeenCalledWith({
			filters: {
				clientId: client.id.toString(),
				saved: goal01.saved.amount,
			},
			pagination: { page: 1, perPage: 10 },
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { data } = result.value
			expect(data).toHaveLength(1)
			expect(data[0]).toEqual(client.goals.items[0])
		}
	})

	const mockGoal = async () => {
		const client = Client.create({
			email: 'teste@gmail.com',
			name: 'testualdo',
			passwordHash: 'some_password',
			monthlyIncome: new Money(5000),
		})

		await clientRepository.create(client)

		const goal01 = Goal.create({
			clientId: new UniqueEntityId(client.id.toString()),
			target: new Money(100),
			saved: new Money(10),
			startedAt: new Date('2025-07-21'),
			endedAt: new Date('2025-08-21'),
		})

		const goal02 = Goal.create({
			clientId: new UniqueEntityId(client.id.toString()),
			target: new Money(1000),
			saved: new Money(100),
			startedAt: new Date('2025-07-20'),
			endedAt: new Date('2025-08-20'),
		})

		client.addGoal(goal01)
		client.addGoal(goal02)

		eventBus.dispatchEventsForAggregate(client.id as UniqueEntityId)
		await clientRepository.save(client)

		const mockResolved: OutputCollectionDTO<GoalSummaryDTO> = {
			data: [goal01, goal02],
			meta: {
				currentPage: 1,
				pageCount: 10,
				totalCount: 2,
				totalPages: 1,
			},
		}

		const mockResolved01: OutputCollectionDTO<GoalSummaryDTO> = {
			data: [goal01],
			meta: {
				currentPage: 1,
				pageCount: 10,
				totalCount: 2,
				totalPages: 1,
			},
		}

		return { client, goal01, goal02, mockResolved, mockResolved01 }
	}
})
