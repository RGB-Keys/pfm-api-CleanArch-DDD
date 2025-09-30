import { DomainEvents } from '@/api/core/events/domain-events'
import { EventHandler } from '@/api/core/events/event-handler'
import { IncomeAddedEvent } from '../../../domain/events/income/income-added.event'

export class SendIncomeNotificationHandler implements EventHandler {
	setupSubscriptions(): void {
		DomainEvents.register(this.handle.bind(this), IncomeAddedEvent.name)
	}

	private handle(event: IncomeAddedEvent): void {
		console.log(
			`[NOTIFICATION] Client ${event.clientId.toString()} recebeu uma nova renda de R$${event.amount}`,
		)
	}
}
