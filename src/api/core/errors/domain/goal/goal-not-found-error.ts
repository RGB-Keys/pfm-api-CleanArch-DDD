import { HttpStatusCode } from '@/api/core/enums/http-status-code'
import { DomainError } from '../domain-error.abstract'

export class GoalNotFoundError extends DomainError {
	constructor(message: string = 'Goal not found') {
		super(message, HttpStatusCode.NOT_FOUND, `${new.target.name}`)
	}
}
