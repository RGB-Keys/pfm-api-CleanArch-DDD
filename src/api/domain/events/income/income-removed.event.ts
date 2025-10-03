import { DomainEvent } from '@/api/core/events/domain-event'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'

export class IncomeRemovedEvent extends DomainEvent {
	public occurredAt: Date
	public name = 'IncomeRemovedEvent'

	constructor(
		public readonly incomeId: UniqueEntityId,
		public readonly clientId: UniqueEntityId,
	) {
		super()
		this.occurredAt = new Date()
	}

	getAggregateId(): UniqueEntityId {
		return this.clientId
	}
}
