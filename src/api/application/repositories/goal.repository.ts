import { Goal } from '@/api/domain/entities/goal.entity'

export abstract class GoalRepository {
	abstract create(goal: Goal): Promise<void>
	abstract findUnique(params: FindUniqueGoalParams): Promise<Goal | null>
	abstract save(goal: Goal): Promise<void>
	abstract remove(goal: Goal): Promise<void>
}

export interface FindUniqueGoalParams {
	goalId?: string
}
