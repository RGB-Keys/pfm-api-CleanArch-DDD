import { HashGenerator } from '@/api/application/cryptography/hash-generator'
import { ClientRepository } from '@/api/application/repositories/client.repository'
import { ClientAlreadyExistsError } from '@/api/core/errors/domain/client/client-already-exists-error'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { Client } from '@/api/domain/entities/client.entity'

interface RegisterClientUseCaseRequest {
	name: string
	phoneNumber?: string
	email: string
	password: string
}

type RegisterClientUseCaseResponse = Either<
	ClientAlreadyExistsError,
	{
		client: Client
	}
>

export class RegisterClientUseCase {
	constructor(
		private readonly clientRepository: ClientRepository,
		private readonly hashGenerator: HashGenerator,
	) {}

	async execute({
		email,
		name,
		password,
		phoneNumber,
	}: RegisterClientUseCaseRequest): Promise<RegisterClientUseCaseResponse> {
		const clientWithSameEmail = await this.clientRepository.findUnique({
			email,
		})

		if (clientWithSameEmail) return fail(new ClientAlreadyExistsError())

		const passwordHash = await this.hashGenerator.hash(password)

		const client = Client.create({
			email,
			passwordHash,
			name,
			phoneNumber,
		})

		await this.clientRepository.create(client)

		return success({ client })
	}
}
