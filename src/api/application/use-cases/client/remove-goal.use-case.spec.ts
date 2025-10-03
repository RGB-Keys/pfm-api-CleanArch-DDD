import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { GoalNotFoundError } from '@/api/core/errors/domain/goal/goal-not-found-error'
import { NotAllowedError } from '@/api/core/errors/domain/not-allowed-error'
import { EventBus } from '@/api/core/events/event-bus'
import { Client } from '@/api/domain/entities/client.entity'
import { Goal } from '@/api/domain/entities/goal.entity'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { ClientRepository } from '../../repositories/client.repository'
import { GoalRepository } from '../../repositories/goal.repository'
import { RemoveGoalUseCase } from './remove-goal.use-case'

describe('Remove Goal Use Case', async () => {
	let clientRepository: ClientRepository
	let goalRepository: GoalRepository
	let eventBus: EventBus
	let sut: RemoveGoalUseCase

	beforeEach(() => {
		clientRepository = {
			create: vi.fn(),
			findUnique: vi.fn(),
			save: vi.fn(),
		} as unknown as ClientRepository

		goalRepository = {
			findUnique: vi.fn(),
		} as unknown as GoalRepository

		eventBus = {
			markAggregateForDispatch: vi.fn(),
			dispatchEventsForAggregate: vi.fn(),
		}

		sut = new RemoveGoalUseCase(clientRepository, goalRepository, eventBus)
	})

	it('should be able to remove a goal', async () => {
		const { client, goal } = await mockGoal()

		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(client)
		vi.spyOn(goalRepository, 'findUnique').mockResolvedValueOnce(goal)

		const savedClient = vi
			.spyOn(clientRepository, 'save')
			.mockResolvedValueOnce()

		const result = await sut.execute({
			goalId: goal.id.toString(),
			clientId: client.id.toString(),
		})

		expect(savedClient).toHaveBeenCalledWith(client)
		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(client.goals.removedNewItems[0]).toEqual(goal)
			expect(result.value).toEqual(undefined)
		}
	})

	it('should not be able to remove a goal if client doesnt exist', async () => {
		const { goal } = await mockGoal()

		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(null)
		vi.spyOn(goalRepository, 'findUnique').mockResolvedValueOnce(goal)

		const result = await sut.execute({
			clientId: 'wrong-id',
			goalId: goal.id.toString(),
		})

		expect(result.isFail()).toBe(true)
		expect(result.value).toBeInstanceOf(ClientNotFoundError)
	})

	it('should not be able to remove a goal if goal doesnt exist', async () => {
		const { client } = await mockGoal()

		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(client)
		vi.spyOn(goalRepository, 'findUnique').mockResolvedValueOnce(null)

		const result = await sut.execute({
			clientId: client.id.toString(),
			goalId: 'wrong-id',
		})

		expect(result.isFail()).toBe(true)
		expect(result.value).toBeInstanceOf(GoalNotFoundError)
	})

	it('should return NotAllowedError if client is not the goal owner', async () => {
		const { otherClient, goal } = await mockGoal()

		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(otherClient)
		vi.spyOn(goalRepository, 'findUnique').mockResolvedValueOnce(goal)

		const result = await sut.execute({
			clientId: otherClient.id.toString(),
			goalId: goal.id.toString(),
		})

		expect(result.isFail()).toBe(true)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	const mockGoal = async () => {
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

		const goal = Goal.create({
			clientId: new UniqueEntityId(client.id.toString()),
			target: new Money(100),
			saved: new Money(50),
			endedAt: new Date('2025-08-20'),
		})

		client.addGoal(goal)

		eventBus.dispatchEventsForAggregate(client.id as UniqueEntityId)
		await clientRepository.save(client)
		return { client, otherClient, goal }
	}
})
