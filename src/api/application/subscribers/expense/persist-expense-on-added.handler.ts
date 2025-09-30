import { EventHandler } from '@/api/core/events/event-handler'
import { DomainEvents } from '@/api/core/events/domain-events'
import { ExpenseAddedEvent } from '@/api/domain/events/expense/expense-added.event'
import { Expense } from '@/api/domain/entities/expense.entity'
import { ExpenseRepository } from '../../repositories/expense.repository'

export class PersistExpenseOnAddedHandler implements EventHandler {
	constructor(private expenseRepository: ExpenseRepository) {}

	setupSubscriptions(): void {
		DomainEvents.register(this.handle.bind(this), ExpenseAddedEvent.name)
	}

	private async handle(event: ExpenseAddedEvent): Promise<void> {
		const expense = Expense.restore(
			{
				clientId: event.clientId,
				amount: event.amount,
				category: event.category,
				date: event.date,
				description: event.description,
			},
			event.expenseId,
		)

		await this.expenseRepository.create(expense)
	}
}
