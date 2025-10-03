import { OutputCollectionDTO } from '@/api/core/dtos/output-collection-dto'
import { SearchParams } from '@/api/core/search/search-params'
import { Goal } from '@/api/domain/entities/goal.entity'
import { GoalSummaryDTO } from '../dtos/goal.dto'

export abstract class GoalRepository {
	abstract findUnique(params: FindUniqueGoalParams): Promise<Goal | null>
	abstract listSummary(
		params?: SearchParams<GoalSearchableFields>,
	): Promise<OutputCollectionDTO<GoalSummaryDTO>>
}

export interface FindUniqueGoalParams {
	goalId?: string
}

export interface GoalSearchableFields {
	clientId: string
	target: number
	startedAt: Date
	endedAt?: Date | null
	saved: number
}
