import { EntityId } from './entity-id'
import { UniqueEntityId } from './value-objects/unique-entity-id'

export abstract class Entity {
	protected readonly _id: EntityId

	protected constructor(id?: EntityId, createId?: () => EntityId) {
		this._id = id ?? createId?.() ?? new UniqueEntityId()
	}

	get id(): EntityId {
		return this._id
	}

	equals(entity: Entity): boolean {
		return entity.id.equals(this._id)
	}
}
