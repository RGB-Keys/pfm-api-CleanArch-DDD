import { AggregateRoot } from '../entities/aggregate-root'
import { UniqueEntityId } from '../entities/value-objects/unique-entity-id'
import { DomainEvents } from './domain-events'
import { EventBus } from './event-bus'

export class DomainEventsAdapter implements EventBus {
	markAggregateForDispatch(aggregate: AggregateRoot): void {
		DomainEvents.markAggregateForDispatch(aggregate)
	}

	dispatchEventsForAggregate(id: UniqueEntityId): void {
		DomainEvents.dispatchEventsForAggregate(id)
	}
}
