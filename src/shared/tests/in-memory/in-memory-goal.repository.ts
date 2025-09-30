import {
	GoalRepository,
	FindUniqueGoalParams,
} from '@/api/application/repositories/goal.repository'
import { Goal } from '@/api/domain/entities/goal.entity'

export class InMemoryGoalRepository implements GoalRepository {
	public items: Goal[] = []

	async create(goal: Goal) {
		this.items.push(goal)
	}

	async findUnique(params: FindUniqueGoalParams) {
		const goal = this.items.find((item) => item.id.toString() === params.goalId)

		if (!goal) return null

		return goal
	}

	async save(goal: Goal) {
		const itemIndex = this.items.findIndex((item) => item.id === goal.id)

		this.items[itemIndex] = goal
	}

	async remove(goal: Goal) {
		const itemIndex = this.items.findIndex((item) => item.id === goal.id)

		this.items.splice(itemIndex, 1)
	}
}
