import { Client } from '@/api/domain/entities/client.entity'

export abstract class ClientRepository {
	abstract findUnique(params: FindUniqueClientParams): Promise<Client | null>
	abstract create(client: Client): Promise<void>
	abstract save(client: Client): Promise<void>
	abstract remove(client: Client): Promise<void>
}

export interface FindUniqueClientParams {
	clientId?: string
	email?: string
}
