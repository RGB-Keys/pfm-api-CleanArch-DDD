import { DomainError } from '@/api/core/errors/domain/domain-error.abstract'
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'

@Catch(Error)
export class DomainErrorFilter implements ExceptionFilter {
	catch(exception: Error, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()

		if (exception instanceof DomainError) {
			return response.status(exception.httpStatusCode).json({
				statusCode: exception.httpStatusCode,
				message: exception.message,
				error: exception.name,
			})
		}

		return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			message: exception.message,
			error: 'InternalServerError',
		})
	}
}
