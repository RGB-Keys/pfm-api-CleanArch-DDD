import { HttpStatusCode } from '@/api/core/enums/http-status-code'
import { DomainError } from '../domain-error.abstract'

export class ClientNotFoundError extends DomainError {
	constructor(message: string = 'Client not found') {
		super(message, HttpStatusCode.NOT_FOUND, `${new.target.name}`)
	}
}
