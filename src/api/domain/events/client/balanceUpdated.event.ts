import { DomainEvent } from '@/api/core/events/domain-event'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { Money } from '../../entities/value-objects/money.value-object'

export class BalanceUpdatedEvent extends DomainEvent {
	public readonly occurredAt: Date = new Date()
	public readonly name = 'BalanceUpdatedEvent'

	constructor(
		public readonly clientId: UniqueEntityId,
		public readonly balance: Money,
	) {
		super()
	}

	getAggregateId(): UniqueEntityId {
		return this.clientId
	}
}
