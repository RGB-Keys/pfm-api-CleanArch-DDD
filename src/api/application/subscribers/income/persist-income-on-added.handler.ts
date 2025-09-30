import { EventHandler } from '@/api/core/events/event-handler'
import { DomainEvents } from '@/api/core/events/domain-events'
import { Income } from '@/api/domain/entities/income.entity'
import { IncomeRepository } from '../../repositories/income.repository'
import { IncomeAddedEvent } from '@/api/domain/events/income/income-added.event'

export class PersistIncomeOnAddedHandler implements EventHandler {
	constructor(private incomeRepository: IncomeRepository) {}

	setupSubscriptions(): void {
		DomainEvents.register(this.handle.bind(this), IncomeAddedEvent.name)
	}

	private async handle(event: IncomeAddedEvent): Promise<void> {
		const income = Income.restore(
			{
				clientId: event.clientId,
				amount: event.amount,
				category: event.category,
				date: event.date,
				description: event.description,
			},
			event.incomeId,
		)

		await this.incomeRepository.create(income)
	}
}
