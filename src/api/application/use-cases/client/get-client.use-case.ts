import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { Either, fail, success } from '@/api/core/errors/either/either'
import { Client } from '@/api/domain/entities/client.entity'
import { ClientRepository } from '../../repositories/client.repository'

interface GetClientUseCaseRequest {
	clientId: string
}

type GetClientUseCaseResponse = Either<
	ClientNotFoundError,
	{
		client: Client
	}
>

export class GetClientUseCase {
	constructor(private clientRepository: ClientRepository) {}

	async execute({
		clientId,
	}: GetClientUseCaseRequest): Promise<GetClientUseCaseResponse> {
		const client = await this.clientRepository.findUnique({ clientId })

		if (!client) return fail(new ClientNotFoundError())

		return success({ client })
	}
}
