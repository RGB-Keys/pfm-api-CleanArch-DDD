import { HttpStatusCode } from '../../enums/http-status-code'

export abstract class DomainError extends Error {
	readonly message: string
	readonly httpStatusCode: HttpStatusCode
	readonly error: string

	constructor(message: string, httpStatusCode: HttpStatusCode, error: string) {
		super(message)
		this.message = message
		this.httpStatusCode = httpStatusCode
		this.error = error
	}
}
