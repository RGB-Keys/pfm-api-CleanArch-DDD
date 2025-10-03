import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { EventBus } from '@/api/core/events/event-bus'
import { Client } from '@/api/domain/entities/client.entity'
import { Goal } from '@/api/domain/entities/goal.entity'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { ClientRepository } from '../../repositories/client.repository'
import { CreateGoalUseCase } from './create-goal.use-case'

describe('Create Goal Use Case', () => {
	let clientRepository: ClientRepository
	let eventBus: EventBus
	let sut: CreateGoalUseCase

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

		sut = new CreateGoalUseCase(clientRepository, eventBus)
	})

	it('should be able to create a new goal', async () => {
		const { client } = await mockClient()

		const findClient = vi
			.spyOn(clientRepository, 'findUnique')
			.mockResolvedValueOnce(client)

		const savedClient = vi
			.spyOn(clientRepository, 'save')
			.mockResolvedValueOnce()

		const request = {
			clientId: client.id.toString(),
			target: 100,
			saved: 50,
			endedAt: new Date('2025-08-20'),
		}

		const result = await sut.execute(request)

		expect(savedClient).toHaveBeenCalledWith(client)
		expect(findClient).toHaveBeenCalledWith({ clientId: client.id.toString() })
		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { goal } = result.value
			expect(goal).toBeInstanceOf(Goal)
			expect(goal).toMatchObject({
				clientId: client.goals.items[0].clientId,
				target: client.goals.items[0].target,
				saved: client.goals.items[0].saved,
				endedAt: client.goals.items[0].endedAt,
			})
		}
	})

	it('should track new goal in watched list', async () => {
		const { client } = await mockClient()

		const goal = Goal.create({
			clientId: client.id as UniqueEntityId,
			target: new Money(100),
			saved: new Money(100),
		})

		client.addGoal(goal)

		expect(client.goals.newItems).toContain(goal)
		expect(client.goals.items).toHaveLength(1)
	})

	it('should not be able to create a goal if client not exists', async () => {
		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(null)

		const request = {
			clientId: 'wrong-id',
			target: 100,
			saved: 50,
			endedAt: new Date('2025-08-20'),
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

		return { client }
	}
})
