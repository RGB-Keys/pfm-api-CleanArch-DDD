import { GoalNotFoundError } from '@/api/core/errors/domain/goal/goal-not-found-error'
import { Goal } from '@/api/domain/entities/goal.entity'
import { InMemoryGoalRepository } from '@/shared/tests/in-memory/in-memory-goal.repository'
import { GetGoalUseCase } from './get-goal.use-case'
import { Client } from '@/api/domain/entities/client.entity'
import { InMemoryClientRepository } from '@/shared/tests/in-memory/in-memory-client.repository'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { PersistGoalOnAddedHandler } from '../../subscribers/goal/persist-goal-on-added.handler'
import { DomainEvents } from '@/api/core/events/domain-events'

describe('Get Goal Use Case', async () => {
	let clientRepository: InMemoryClientRepository
	let goalRepository: InMemoryGoalRepository
	let handler: PersistGoalOnAddedHandler
	let sut: GetGoalUseCase

	beforeEach(() => {
		clientRepository = new InMemoryClientRepository()
		goalRepository = new InMemoryGoalRepository()
		handler = new PersistGoalOnAddedHandler(goalRepository)
		sut = new GetGoalUseCase(goalRepository)

		handler.setupSubscriptions()
	})

	it('should be able to get a goal', async () => {
		const existingGoal = await mockGoal()

		const result = await sut.execute({
			goalId: existingGoal.id.toString(),
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { goal } = result.value
			expect(goal).toEqual(existingGoal)
		}
	})

	it('should not be able to get a goal if doesnt exist', async () => {
		const result = await sut.execute({ goalId: 'wrond-id' })

		expect(result.isFail()).toBe(true)
		expect(result.value).toBeInstanceOf(GoalNotFoundError)
	})

	const mockGoal = async () => {
		const client = Client.create({
			email: 'teste@gmail.com',
			name: 'testualdo',
			passwordHash: 'some_password',
		})

		await clientRepository.create(client)

		const goal = Goal.create({
			clientId: new UniqueEntityId(client.id.toString()),
			target: new Money(100),
			saved: new Money(50),
			deadline: new Date('2025-08-20'),
		})

		client.addGoal(goal)
		DomainEvents.dispatchEventsForAggregate(client.id as UniqueEntityId)
		await clientRepository.save(client)

		return goal
	}
})
