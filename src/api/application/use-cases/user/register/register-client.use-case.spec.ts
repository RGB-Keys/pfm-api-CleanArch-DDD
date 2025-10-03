import { ClientRepository } from '@/api/application/repositories/client.repository'
import { ClientAlreadyExistsError } from '@/api/core/errors/domain/client/client-already-exists-error'
import { Client } from '@/api/domain/entities/client.entity'
import { UserRole } from '@/api/domain/enums/user/role'
import { RegisterClientUseCase } from './register-client.use-case'

describe('Register Client Use Case', () => {
	let clientRepository: ClientRepository
	let hashGenerator: { hash: ReturnType<typeof vi.fn> }
	let sut: RegisterClientUseCase

	beforeEach(() => {
		clientRepository = {
			create: vi.fn(),
			findUnique: vi.fn(),
		} as unknown as ClientRepository

		hashGenerator = { hash: vi.fn() }
		sut = new RegisterClientUseCase(clientRepository, hashGenerator)
	})

	it('should be able register a new client', async () => {
		hashGenerator.hash.mockResolvedValue('hashed_password')

		const findClient = vi
			.spyOn(clientRepository, 'findUnique')
			.mockResolvedValueOnce(null)

		const request = {
			name: 'John Doe',
			email: 'johndoe@gmail.com',
			password: 'E3htJyu1r6',
			phoneNumber: '88888888888',
		}

		vi.spyOn(clientRepository, 'create').mockResolvedValue()

		const result = await sut.execute(request)

		expect(findClient).toHaveBeenCalledWith({
			email: request.email,
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { client } = result.value

			expect(client).toBeInstanceOf(Client)
			expect(client).toMatchObject({
				name: request.name,
				email: request.email,
				passwordHash: 'hashed_password',
				phoneNumber: request.phoneNumber,
				role: UserRole.CLIENT,
			})
		}
	})

	it('should not be able register a client if email already exists', async () => {
		const existingClient = Client.create({
			name: 'John Doe',
			email: 'johndoe@gmail.com',
			passwordHash: 'E3htJyu1r6',
			phoneNumber: '88888888888',
		})
		clientRepository.create(existingClient)

		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(
			existingClient,
		)

		const request = {
			name: 'John Doe 2',
			email: 'johndoe@gmail.com',
			password: 'E3htJyu1r6',
			phoneNumber: '88888888883',
		}

		const result = await sut.execute(request)

		expect(result.isFail()).toBe(true)
		expect(result.value).toBeInstanceOf(ClientAlreadyExistsError)
	})
})
