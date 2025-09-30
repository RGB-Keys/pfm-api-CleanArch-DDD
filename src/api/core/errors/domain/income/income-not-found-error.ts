import { HttpStatusCode } from '@/api/core/enums/http-status-code'
import { DomainError } from '../domain-error.abstract'

export class IncomeNotFoundError extends DomainError {
	constructor(message: string = 'Income not found') {
		super(message, HttpStatusCode.NOT_FOUND, `${new.target.name}`)
	}
}
