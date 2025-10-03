import { Expense } from '@/api/domain/entities/expense.entity'

export class ExpenseSummaryDTO {
	id!: Expense['id']
	clientId!: Expense['clientId']
	amount!: Expense['amount']
	date!: Expense['date']
	description?: Expense['description']
	category?: Expense['category']
	updatedAt?: Expense['updatedAt']
}
