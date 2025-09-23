import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { Client } from '@/api/domain/entities/client.entity'
import { InMemoryClientRepository } from '@/tests/in-memory/in-memory-client.repository'
import { UpdateClientUseCase } from './update-client.use-case'

describe('Update Client Use Case', async () => {
	let clientRepository: InMemoryClientRepository
	let sut: UpdateClientUseCase

	beforeEach(() => {
		clientRepository = new InMemoryClientRepository()
		sut = new UpdateClientUseCase(clientRepository)
	})

	it('should be able to update a client', async () => {
		const { existingClient, request } = await mockClient()

		const result = await sut.execute({
			clientId: existingClient.id.toString(),
			data: request,
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { client } = result.value
			expect(client).toEqual(existingClient)
		}
	})

	it('should not be able to update a client if doesnt exist', async () => {
		const result = await sut.execute({ clientId: 'wrong-id', data: {} })

		expect(result.isFail()).toBe(true)
		expect(result.value).toBeInstanceOf(ClientNotFoundError)
	})

	const mockClient = async () => {
		const existingClient = Client.create({
			email: 'teste@gmail.com',
			name: 'testualdo',
			passwordHash: 'some_password',
		})
		await clientRepository.create(existingClient)

		const request = {
			email: 'testualdo@gmail.com',
			password: 'other_password',
			phoneNumber: '88999999999',
		}

		return { existingClient, request }
	}
})
