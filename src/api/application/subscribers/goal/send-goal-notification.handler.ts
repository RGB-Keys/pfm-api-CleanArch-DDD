import { DomainEvents } from '@/api/core/events/domain-events'
import { EventHandler } from '@/api/core/events/event-handler'
import { GoalContributedEvent } from '../../../domain/events/goal/goal-contribute.event'

export class NotifyGoalHandler implements EventHandler {
	setupSubscriptions(): void {
		DomainEvents.register(this.handle.bind(this), GoalContributedEvent.name)
	}

	private handle(event: GoalContributedEvent): void {
		console.log(
			`[NOTIFICATION] Cliente ${event.clientId.toString()} contribuiu com R$${event.contributedAmount} para a meta ${event.goalId.toString()}`,
		)
	}
}
