import { DomainEvent } from '@/api/core/events/domain-event'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { Money } from '../../entities/value-objects/money.value-object'
import { Category } from '../../entities/value-objects/category.value-object'

export class ExpenseAddedEvent extends DomainEvent {
	public occurredAt: Date
	public name = 'ExpenseAddedEvent'

	constructor(
		public readonly expenseId: UniqueEntityId,
		public readonly clientId: UniqueEntityId,
		public readonly amount: Money,
		public readonly date: Date,
		public readonly category?: Category | null,
		public readonly description?: string | null,
	) {
		super()
		this.occurredAt = new Date()
	}

	getAggregateId(): UniqueEntityId {
		return this.clientId
	}
}
