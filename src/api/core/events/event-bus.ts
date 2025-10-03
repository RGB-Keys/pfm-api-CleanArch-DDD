// core/events/event-bus.ts
import { UniqueEntityId } from '../entities/value-objects/unique-entity-id'
import { AggregateRoot } from '../entities/aggregate-root'

export interface EventBus {
	markAggregateForDispatch(aggregate: AggregateRoot): void
	dispatchEventsForAggregate(id: UniqueEntityId): void
}
