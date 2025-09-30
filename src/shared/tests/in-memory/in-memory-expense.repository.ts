import {
	ExpenseRepository,
	FindUniqueExpenseParams,
} from '@/api/application/repositories/expense.repository'
import { Expense } from '@/api/domain/entities/expense.entity'

export class InMemoryExpenseRepository implements ExpenseRepository {
	public items: Expense[] = []

	async create(expense: Expense) {
		this.items.push(expense)
	}

	async findUnique(params: FindUniqueExpenseParams) {
		const expense = this.items.find(
			(item) => item.id.toString() === params.expenseId,
		)

		if (!expense) return null

		return expense
	}

	async save(expense: Expense) {
		const itemIndex = this.items.findIndex((item) => item.id === expense.id)

		this.items[itemIndex] = expense
	}

	async remove(expense: Expense) {
		const itemIndex = this.items.findIndex((item) => item.id === expense.id)

		this.items.splice(itemIndex, 1)
	}
}
