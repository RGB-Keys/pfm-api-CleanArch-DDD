import { EventHandler } from '@/api/core/events/event-handler'
import { DomainEvents } from '@/api/core/events/domain-events'

import { Goal } from '@/api/domain/entities/goal.entity'
import { GoalRepository } from '../../repositories/goal.repository'
import { GoalAddedEvent } from '@/api/domain/events/goal/goal-added.event'

export class PersistGoalOnAddedHandler implements EventHandler {
	constructor(private goalRepository: GoalRepository) {}

	setupSubscriptions(): void {
		DomainEvents.register(this.handle.bind(this), GoalAddedEvent.name)
	}

	private async handle(event: GoalAddedEvent): Promise<void> {
		const goal = Goal.restore(
			{
				clientId: event.clientId,
				saved: event.saved,
				target: event.target,
				deadline: event.deadline,
			},
			event.goalId,
		)

		await this.goalRepository.create(goal)
	}
}
