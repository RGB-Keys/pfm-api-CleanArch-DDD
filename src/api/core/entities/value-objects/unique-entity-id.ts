import { randomUUID } from 'node:crypto'
import { EntityId } from '../entity-id'

export class UniqueEntityId implements EntityId {
	private value: string

	constructor(value?: string) {
		this.value = value ?? randomUUID()
	}

	toString() {
		return this.value
	}

	toValue() {
		return this.value
	}

	equals(id: UniqueEntityId) {
		return id.toValue() === this.value
	}
}
