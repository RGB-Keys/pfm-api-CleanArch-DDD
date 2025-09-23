// Error
export class Fail<F, S> {
	readonly value: F

	constructor(value: F) {
		this.value = value
	}

	isSuccess(): this is Success<F, S> {
		return false
	}

	isFail(): this is Fail<F, S> {
		return true
	}
}

// Success
export class Success<F, S> {
	readonly value: S

	constructor(value: S) {
		this.value = value
	}

	isSuccess(): this is Success<F, S> {
		return true
	}

	isFail(): this is Fail<F, S> {
		return false
	}
}

export type Either<F, S> = Fail<F, S> | Success<F, S>

export const fail = <F, S>(value: F): Either<F, S> => {
	return new Fail(value)
}

export const success = <F, S>(value: S): Either<F, S> => {
	return new Success(value)
}
