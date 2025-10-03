import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { Client } from '@/api/domain/entities/client.entity'
import { ClientRepository } from '../../repositories/client.repository'

interface UpdateClientUseCaseRequest {
	clientId: string
	data: {
		name?: string
		phoneNumber?: string
		avatarUrl?: string
		email?: string
		passwordHash?: string
	}
}

type UpdateClientUseCaseResponse = Either<
	ClientNotFoundError,
	{
		client: Client
	}
>

export class UpdateClientUseCase {
	constructor(private readonly clientRepository: ClientRepository) {}

	async execute({
		clientId,
		data,
	}: UpdateClientUseCaseRequest): Promise<UpdateClientUseCaseResponse> {
		const client = await this.clientRepository.findUnique({ clientId })

		if (!client) return fail(new ClientNotFoundError())

		client.updateUserProps(data)

		await this.clientRepository.save(client)

		return success({ client })
	}
}
