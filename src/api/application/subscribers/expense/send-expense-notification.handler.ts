import { DomainEvents } from '@/api/core/events/domain-events'
import { EventHandler } from '@/api/core/events/event-handler'
import { ExpenseAddedEvent } from '../../../domain/events/expense/expense-added.event'

export class SendExpenseNotificationHandler implements EventHandler {
	setupSubscriptions(): void {
		DomainEvents.register(this.handle.bind(this), ExpenseAddedEvent.name)
	}

	private handle(event: ExpenseAddedEvent): void {
		console.log(
			`[NOTIFICATION] Cliente ${event.clientId.toString()} adicionou uma despesa de R$${event.amount}`,
		)
	}
}
