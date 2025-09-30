import { DomainEvent } from '@/api/core/events/domain-event'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { Money } from '../../entities/value-objects/money.value-object'

export class GoalContributedEvent extends DomainEvent {
	public occurredAt: Date
	public name = 'GoalContributedEvent'

	constructor(
		public readonly goalId: UniqueEntityId,
		public readonly clientId: UniqueEntityId,
		public readonly contributedAmount: Money,
	) {
		super()
		this.occurredAt = new Date()
	}

	getAggregateId(): UniqueEntityId {
		return this.clientId
	}
}
