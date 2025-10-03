import { DomainEvent } from '@/api/core/events/domain-event'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { Money } from '../../entities/value-objects/money.value-object'

export class GoalAddedEvent extends DomainEvent {
	public occurredAt: Date
	public name = 'GoalAddedEvent'

	constructor(
		public readonly goalId: UniqueEntityId,
		public readonly clientId: UniqueEntityId,
		public readonly saved: Money,
		public readonly target: Money,
		public readonly startedAt: Date,
		public readonly endedAt?: Date | null,
	) {
		super()
		this.occurredAt = new Date()
	}

	getAggregateId(): UniqueEntityId {
		return this.clientId
	}
}
