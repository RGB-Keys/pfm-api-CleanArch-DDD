import { WatchedList } from '@/api/core/entities/watched-list'
import { Income } from '../income.entity'

export class IncomeList extends WatchedList<Income> {
	protected compareItems(a: Income, b: Income): boolean {
		return a.id.equals(b.id)
	}
}
