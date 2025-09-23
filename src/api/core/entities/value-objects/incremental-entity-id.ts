import { EntityId } from '../entity-id'

export class IncrementalEntityId implements EntityId {
	private static currentId = 0
	private value: number

	constructor(value?: number) {
		if (value !== undefined) {
			this.value = value
		} else {
			IncrementalEntityId.currentId += 1
			this.value = IncrementalEntityId.currentId
		}
	}

	toNumber() {
		return this.value
	}

	toString() {
		return this.value.toString()
	}

	toValue() {
		return this.value
	}

	equals(id: IncrementalEntityId) {
		return id.toValue() === this.value
	}
}
