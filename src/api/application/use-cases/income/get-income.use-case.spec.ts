import { IncomeNotFoundError } from '@/api/core/errors/domain/income/income-not-found-error'
import { Income } from '@/api/domain/entities/income.entity'
import { InMemoryIncomeRepository } from '@/shared/tests/in-memory/in-memory-income.repository'
import { GetIncomeUseCase } from './get-income.use-case'
import { Client } from '@/api/domain/entities/client.entity'
import { InMemoryClientRepository } from '@/shared/tests/in-memory/in-memory-client.repository'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { Category } from '@/api/domain/entities/value-objects/category.value-object'
import { PersistIncomeOnAddedHandler } from '../../subscribers/income/persist-income-on-added.handler'
import { DomainEvents } from '@/api/core/events/domain-events'

describe('Get Income Use Case', async () => {
	let clientRepository: InMemoryClientRepository
	let incomeRepository: InMemoryIncomeRepository
	let handler: PersistIncomeOnAddedHandler
	let sut: GetIncomeUseCase

	beforeEach(() => {
		clientRepository = new InMemoryClientRepository()
		incomeRepository = new InMemoryIncomeRepository()
		handler = new PersistIncomeOnAddedHandler(incomeRepository)
		sut = new GetIncomeUseCase(incomeRepository)

		handler.setupSubscriptions()
	})

	it('should be able to get a income', async () => {
		const existingIncome = await mockIncome()

		const result = await sut.execute({
			incomeId: existingIncome.id.toString(),
		})

		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			const { income } = result.value
			expect(income).toEqual(existingIncome)
		}
	})

	it('should not be able to get a income if doesnt exist', async () => {
		const result = await sut.execute({ incomeId: 'wrond-id' })

		expect(result.isFail()).toBe(true)
		expect(result.value).toBeInstanceOf(IncomeNotFoundError)
	})

	const mockIncome = async () => {
		const client = Client.create({
			email: 'teste@gmail.com',
			name: 'testualdo',
			passwordHash: 'some_password',
		})

		await clientRepository.create(client)

		const income = Income.create({
			clientId: new UniqueEntityId(client.id.toString()),
			amount: new Money(100),
			category: new Category('Mercadinho'),
			date: new Date('2025-08-20'),
			description: 'Compras de casa',
		})

		client.addIncome(income)
		DomainEvents.dispatchEventsForAggregate(client.id as UniqueEntityId)
		await clientRepository.save(client)

		return income
	}
})
