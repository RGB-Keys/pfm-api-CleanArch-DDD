import { UniqueEntityId } from '../entities/value-objects/unique-entity-id'

export abstract class DomainEvent {
	abstract occurredAt: Date
	abstract name: string
	abstract getAggregateId(): UniqueEntityId
}
