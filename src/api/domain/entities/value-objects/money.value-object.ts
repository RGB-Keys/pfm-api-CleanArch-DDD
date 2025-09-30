import { ValueObject } from '@/api/core/entities/value-object'
import { ValidationError } from '@/api/core/errors/domain/validation-error.domain-error'

/**
 * Value Object que representa a renda mensal de um usuário.
 */
export class Money extends ValueObject<{ amountInCents: number }> {
	constructor(amount: number | string) {
		// Converte string com vírgula ou número para float
		const parsedAmount =
			typeof amount === 'string' ? parseFloat(amount.replace(',', '.')) : amount

		if (typeof parsedAmount !== 'number' || isNaN(parsedAmount)) {
			throw new ValidationError('Invalid money value.')
		}

		// Converte para centavos e arredonda para inteiro
		const amountInCents = Math.round(parsedAmount * 100)

		super({ amountInCents })
		this.validate()
	}

	private validate() {
		if (this.amount < 0) {
			throw new ValidationError('Value cannot be negative.')
		}
	}

	/** Retorna o valor em reais */
	public get amount(): number {
		return this.props.amountInCents / 100
	}

	/** Retorna o valor formatado em moeda brasileira */
	public get formatted(): string {
		return this.amount.toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		})
	}

	/** Soma outra renda */
	public add(other: Money): Money {
		const sum = this.amount + other.amount
		if (isNaN(sum)) throw new ValidationError('Invalid money operation')
		return new Money(sum)
	}

	/** Subtrai outra renda, garantindo que não fique negativa */
	public subtract(other: Money): Money {
		const result = this.amount - other.amount
		if (isNaN(result)) throw new ValidationError('Invalid money operation')
		if (result < 0) {
			throw new ValidationError(
				'The result of the operation cannot be negative.',
			)
		}
		return new Money(result)
	}

	/** Compara dois Value Objects */
	public equals(other: Money): boolean {
		return Math.round(this.amount * 100) === Math.round(other.amount * 100)
	}

	/** Converte para string simples */
	public toString(): string {
		return this.amount.toFixed(2)
	}
}
