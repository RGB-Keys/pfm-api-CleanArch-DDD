import { ValidationError } from '@/api/core/errors/domain/validation-error.domain-error'

type ValidationCheck = () => string | null

export function validateProps(
	checks: ValidationCheck[],
	snapshot?: Record<string, unknown>,
) {
	const errors = checks.map((check) => check()).filter(Boolean) as string[]

	if (errors.length > 0) {
		throw new ValidationError(
			`${errors.join('; ')}. Current object: ${JSON.stringify(snapshot ?? {}, null, 2)}`,
		)
	}
}
