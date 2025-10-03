import { WatchedList } from '@/api/core/entities/watched-list'
import { Goal } from '../goal.entity'

export class GoalList extends WatchedList<Goal> {
	protected compareItems(a: Goal, b: Goal): boolean {
		return a.id.equals(b.id)
	}
}
