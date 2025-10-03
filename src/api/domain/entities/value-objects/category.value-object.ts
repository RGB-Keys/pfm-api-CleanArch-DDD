import { ValueObject } from '@/api/core/entities/value-object'
import { ValidationError } from '@/api/core/errors/domain/validation-error.domain-error'

export class Category extends ValueObject<{ category: string }> {
	constructor(name: string) {
		if (!name || name.trim().length === 0)
			throw new ValidationError('Category name required')
		name = name.trim()

		super({ category: name })
	}

	public get name(): string {
		return this.props.category
	}

	public toString(): string {
		return this.props.category
	}
}
