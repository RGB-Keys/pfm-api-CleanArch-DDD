import { randomUUID } from 'node:crypto'
import { EntityId } from '../entity-id'

export class UniqueEntityId implements EntityId {
	private value: string

	constructor(value?: string) {
		this.value = value ?? randomUUID()
	}

	toString() {
		return this.value.toString()
	}

	toValue() {
		return this.value
	}

	equals(id: EntityId) {
		return id.toValue() === this.value
	}
}
