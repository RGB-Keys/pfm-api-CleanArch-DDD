import { ValueObject } from '@/api/core/entities/value-object'
import { ValidationError } from '@/api/core/errors/domain/validation-error.domain-error'

/**
 * Value Object que representa a renda mensal de um usuário.
 */
export class Money extends ValueObject<number> {
	constructor(amount: number | string) {
		const parsedAmount =
			typeof amount === 'string' ? parseFloat(amount.replace(',', '.')) : amount

		if (isNaN(parsedAmount)) {
			throw new ValidationError('Valor da renda mensal inválido.')
		}

		// Converte para centavos e arredonda para inteiro
		const amountInCents = Math.round(parsedAmount * 100)

		super(amountInCents)
		this.validate()
	}

	private validate() {
		if (this.value < 0) {
			throw new ValidationError('A renda mensal não pode ser negativa.')
		}
	}

	/** Retorna o valor em reais */
	public get value(): number {
		return super.value / 100
	}

	/** Retorna o valor formatado em moeda brasileira */
	public get formatted(): string {
		return this.value.toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		})
	}

	/** Soma outra renda */
	public add(other: Money): Money {
		return new Money((this.value + other.value).toFixed(2))
	}

	/** Subtrai outra renda, garantindo que não fique negativa */
	public subtract(other: Money): Money {
		const result = this.value - other.value
		if (result < 0) {
			throw new ValidationError(
				'O resultado da operação não pode ser negativo.',
			)
		}
		return new Money(result.toFixed(2))
	}

	/** Compara dois Value Objects */
	public equals(other: Money): boolean {
		return Math.round(this.value * 100) === Math.round(other.value * 100)
	}

	/** Converte para string simples */
	public toString(): string {
		return this.value.toFixed(2)
	}
}
