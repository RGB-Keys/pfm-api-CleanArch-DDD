import { HttpStatusCode } from '@/api/core/enums/http-status-code'
import { DomainError } from './domain-error.abstract'

export class NotAllowedError extends DomainError {
	constructor(message: string = 'Not allowed error') {
		super(message, HttpStatusCode.BAD_REQUEST, `${new.target.name}`)
	}
}
