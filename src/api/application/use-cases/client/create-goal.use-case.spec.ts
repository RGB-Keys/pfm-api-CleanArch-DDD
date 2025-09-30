import { CreateGoalUseCase } from './create-goal.use-case'
import { Goal } from '@/api/domain/entities/goal.entity'
import { Client } from '@/api/domain/entities/client.entity'
import { InMemoryClientRepository } from '@/shared/tests/in-memory/in-memory-client.repository'
import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'

describe('Create Goal Use Case', () => {
	let clientRepository: InMemoryClientRepository
	let sut: CreateGoalUseCase

	beforeEach(() => {
		clientRepository = new InMemoryClientRepository()
		sut = new CreateGoalUseCase(clientRepository)
	})

	it('should be able to create a new goal', async () => {
		const client = await mockClient()

		const request = {
			clientId: client.id.toString(),
			target: 100,
			saved: 50,
			deadline: new Date('2025-08-20'),
		}

		const result = await sut.execute(request)

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { goal } = result.value
			expect(goal).toBeInstanceOf(Goal)
			expect(goal).toMatchObject({
				clientId: client.goals[0].clientId,
				target: client.goals[0].target,
				saved: client.goals[0].saved,
				deadline: client.goals[0].deadline,
			})
		}
	})

	it('should not be able to create a goal if client not exists', async () => {
		const request = {
			clientId: 'wrong-id',
			target: 100,
			saved: 50,
			deadline: new Date('2025-08-20'),
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

		return client
	}
})
