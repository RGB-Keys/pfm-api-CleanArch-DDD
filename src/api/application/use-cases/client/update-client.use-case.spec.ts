import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { Client } from '@/api/domain/entities/client.entity'
import { ClientRepository } from '../../repositories/client.repository'
import { UpdateClientUseCase } from './update-client.use-case'

describe('Update Client Use Case', async () => {
	let clientRepository: ClientRepository
	let sut: UpdateClientUseCase

	beforeEach(() => {
		clientRepository = clientRepository = {
			create: vi.fn(),
			findUnique: vi.fn(),
			save: vi.fn(),
		} as unknown as ClientRepository

		sut = new UpdateClientUseCase(clientRepository)
	})

	it('should be able to update a client', async () => {
		const { existingClient, request } = await mockClient()

		const findClient = vi
			.spyOn(clientRepository, 'findUnique')
			.mockResolvedValueOnce(existingClient)

		const savedClient = vi.spyOn(clientRepository, 'save').mockResolvedValue()

		const result = await sut.execute({
			clientId: existingClient.id.toString(),
			data: request,
		})

		expect(findClient).toHaveBeenCalledWith({
			clientId: existingClient.id.toString(),
		})
		expect(savedClient).toHaveBeenCalledWith(existingClient)

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { client } = result.value
			expect(client).toEqual(existingClient)
		}
	})

	it('should not be able to update a client if doesnt exist', async () => {
		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(null)

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
