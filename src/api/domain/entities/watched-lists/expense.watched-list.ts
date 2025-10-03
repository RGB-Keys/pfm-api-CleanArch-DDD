import { WatchedList } from '@/api/core/entities/watched-list'
import { Expense } from '../expense.entity'

export class ExpenseList extends WatchedList<Expense> {
	protected compareItems(a: Expense, b: Expense): boolean {
		return a.id.equals(b.id)
	}
}
