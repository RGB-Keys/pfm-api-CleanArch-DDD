import { HttpStatusCode } from '../../enums/http-status-code'
import { DomainError } from './domain-error.abstract'

export class ValidationError extends DomainError {
	constructor(message: string) {
		super(message, HttpStatusCode.BAD_REQUEST, `${new.target.name}`)
	}
}
