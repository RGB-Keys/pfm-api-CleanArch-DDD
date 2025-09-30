/**
 * Classe base para todos os Value Objects.
 * Suporta props simples ou compostos, imutabilidade e comparação profunda.
 */
export abstract class ValueObject<T> {
	protected readonly props: T

	constructor(props: T) {
		this.props = Object.freeze({ ...props }) // garante imutabilidade profunda superficial
	}

	/**
	 * Retorna o valor encapsulado
	 */
	public get value(): T {
		return this.props
	}

	/**
	 * Compara dois Value Objects.
	 * Para objetos compostos, faz comparação profunda usando JSON.stringify
	 */
	public equals(vo?: ValueObject<T>): boolean {
		if (!vo) return false
		if (vo.constructor !== this.constructor) return false
		return JSON.stringify(this.props) === JSON.stringify(vo.props)
	}

	/**
	 * Retorna representação em JSON do Value Object
	 */
	public toJSON(): T {
		return this.props
	}

	/**
	 * Retorna string legível do Value Object
	 */
	public toString(): string {
		if (typeof this.props === 'object') {
			return JSON.stringify(this.props)
		}
		return String(this.props)
	}
}
