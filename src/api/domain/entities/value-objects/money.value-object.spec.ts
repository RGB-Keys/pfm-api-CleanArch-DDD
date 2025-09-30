import { Money } from './money.value-object'

describe('Money Value Object', () => {
	it('should create a Money value object with valid amount (number)', () => {
		const money = new Money(100)
		expect(money).toBeInstanceOf(Money)
		expect(money.amount).toEqual(100)
	})

	it('should create a Money value object with valid amount (string)', () => {
		const money = new Money('100')
		expect(money).toBeInstanceOf(Money)
		expect(money.toString()).toEqual('100.00')
	})
})
