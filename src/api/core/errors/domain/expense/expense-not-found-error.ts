import { HttpStatusCode } from '@/api/core/enums/http-status-code'
import { DomainError } from '../domain-error.abstract'

export class ExpenseNotFoundError extends DomainError {
	constructor(message: string = 'Expense not found') {
		super(message, HttpStatusCode.NOT_FOUND, `${new.target.name}`)
	}
}
