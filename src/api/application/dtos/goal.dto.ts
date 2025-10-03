import { Goal } from '@/api/domain/entities/goal.entity'

export class GoalSummaryDTO {
	id!: Goal['id']
	clientId!: Goal['clientId']
	target!: Goal['target']
	endedAt?: Goal['endedAt']
	saved!: Goal['saved']
	startedAt!: Goal['startedAt']
	updatedAt?: Goal['updatedAt']
}
