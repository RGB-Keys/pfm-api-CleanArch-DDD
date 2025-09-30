import { DomainEvent } from '@/api/core/events/domain-event'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'

export class GoalReachedEvent extends DomainEvent {
	public occurredAt: Date
	public name = 'GoalReachedEvent'

	constructor(
		public readonly goalId: UniqueEntityId,
		public readonly clientId: UniqueEntityId,
		public readonly target: Money,
	) {
		super()
		this.occurredAt = new Date()
	}

	getAggregateId(): UniqueEntityId {
		return this.clientId
	}
}
