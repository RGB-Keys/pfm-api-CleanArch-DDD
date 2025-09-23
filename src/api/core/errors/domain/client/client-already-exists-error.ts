import { HttpStatusCode } from '@/api/core/enums/http-status-code'
import { DomainError } from '../domain-error.abstract'

export class ClientAlreadyExistsError extends DomainError {
	constructor(message: string = 'Client already exists') {
		super(message, HttpStatusCode.CONFLICT, `${new.target.name}`)
	}
}
