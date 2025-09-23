import {
	ClientRepository,
	FindUniqueClientParams,
} from '@/api/application/repositories/client.repository'
import { Client } from '@/api/domain/entities/client.entity'

export class InMemoryClientRepository implements ClientRepository {
	public items: Client[] = []

	async findUnique(params: FindUniqueClientParams) {
		const client = this.items.find(
			(item) =>
				item.id.toString() === params.clientId || item.email === params.email,
		)

		if (!client) return null

		return client
	}

	async create(client: Client) {
		this.items.push(client)
	}

	async save(client: Client) {
		const itemIndex = this.items.findIndex((item) => item.id === client.id)

		this.items[itemIndex] = client
	}

	async remove(client: Client) {
		const itemIndex = this.items.findIndex((item) => item.id === client.id)

		this.items.splice(itemIndex, 1)
	}
}
