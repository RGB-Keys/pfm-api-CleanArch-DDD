import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { Client } from '@/api/domain/entities/client.entity'
import { ClientRepository } from '../../repositories/client.repository'
import { GetClientUseCase } from './get-client.use-case'

describe('Get Client Use Case', async () => {
	let clientRepository: ClientRepository
	let sut: GetClientUseCase

	beforeEach(() => {
		clientRepository = {
			create: vi.fn(),
			findUnique: vi.fn(),
		} as unknown as ClientRepository

		sut = new GetClientUseCase(clientRepository)
	})

	it('should be able to get a client', async () => {
		const existingClient = await mockClient()

		const findClient = vi
			.spyOn(clientRepository, 'findUnique')
			.mockResolvedValueOnce(existingClient)

		const result = await sut.execute({ clientId: existingClient.id.toString() })

		expect(findClient).toHaveBeenCalledWith({
			clientId: existingClient.id.toString(),
		})
		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { client } = result.value
			expect(client).toEqual(existingClient)
		}
	})

	it('should not be able to get a client if doesnt exist', async () => {
		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(null)

		const result = await sut.execute({ clientId: 'wrong-id' })

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
