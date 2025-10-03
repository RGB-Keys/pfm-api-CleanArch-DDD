import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { ClientNotFoundError } from '@/api/core/errors/domain/client/client-not-found-error'
import { IncomeNotFoundError } from '@/api/core/errors/domain/income/income-not-found-error'
import { NotAllowedError } from '@/api/core/errors/domain/not-allowed-error'
import { EventBus } from '@/api/core/events/event-bus'
import { Client } from '@/api/domain/entities/client.entity'
import { Income } from '@/api/domain/entities/income.entity'
import { Category } from '@/api/domain/entities/value-objects/category.value-object'
import { Money } from '@/api/domain/entities/value-objects/money.value-object'
import { ClientRepository } from '../../repositories/client.repository'
import { IncomeRepository } from '../../repositories/income.repository'
import { RemoveIncomeUseCase } from './remove-income.use-case'

describe('Remove Income Use Case', async () => {
	let clientRepository: ClientRepository
	let incomeRepository: IncomeRepository
	let eventBus: EventBus
	let sut: RemoveIncomeUseCase

	beforeEach(() => {
		clientRepository = {
			create: vi.fn(),
			findUnique: vi.fn(),
			save: vi.fn(),
		} as unknown as ClientRepository

		incomeRepository = {
			findUnique: vi.fn(),
		} as unknown as IncomeRepository

		eventBus = {
			markAggregateForDispatch: vi.fn(),
			dispatchEventsForAggregate: vi.fn(),
		}

		sut = new RemoveIncomeUseCase(clientRepository, incomeRepository, eventBus)
	})

	it('should be able to remove a income', async () => {
		const { client, income } = await mockIncome()

		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(client)
		vi.spyOn(incomeRepository, 'findUnique').mockResolvedValueOnce(income)

		const savedClient = vi
			.spyOn(clientRepository, 'save')
			.mockResolvedValueOnce()

		const result = await sut.execute({
			incomeId: income.id.toString(),
			clientId: client.id.toString(),
		})

		expect(savedClient).toHaveBeenCalledWith(client)
		expect(result.isSuccess()).toBe(true)
		if (result.isSuccess()) {
			expect(client.incomes.removedNewItems[0]).toEqual(income)
			expect(result.value).toEqual(undefined)
		}
	})

	it('should not be able to remove a income if client doesnt exist', async () => {
		const { income } = await mockIncome()

		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(null)
		vi.spyOn(incomeRepository, 'findUnique').mockResolvedValueOnce(income)

		const result = await sut.execute({
			clientId: 'wrong-id',
			incomeId: income.id.toString(),
		})

		expect(result.isFail()).toBe(true)
		expect(result.value).toBeInstanceOf(ClientNotFoundError)
	})

	it('should not be able to remove a income if income doesnt exist', async () => {
		const { client } = await mockIncome()

		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(client)
		vi.spyOn(incomeRepository, 'findUnique').mockResolvedValueOnce(null)

		const result = await sut.execute({
			clientId: client.id.toString(),
			incomeId: 'wrong-id',
		})

		expect(result.isFail()).toBe(true)
		expect(result.value).toBeInstanceOf(IncomeNotFoundError)
	})

	it('should return NotAllowedError if client is not the income owner', async () => {
		const { otherClient, income } = await mockIncome()

		vi.spyOn(clientRepository, 'findUnique').mockResolvedValueOnce(otherClient)
		vi.spyOn(incomeRepository, 'findUnique').mockResolvedValueOnce(income)

		const result = await sut.execute({
			clientId: otherClient.id.toString(),
			incomeId: income.id.toString(),
		})

		expect(result.isFail()).toBe(true)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	const mockIncome = async () => {
		const client = Client.create({
			email: 'teste@gmail.com',
			name: 'testualdo',
			passwordHash: 'some_password',
			monthlyIncome: new Money(5000),
		})

		const otherClient = Client.create({
			email: 'teste01@gmail.com',
			name: 'testualdo01',
			passwordHash: 'some_password',
		})

		await clientRepository.create(client)
		await clientRepository.create(otherClient)

		const income = Income.create({
			clientId: new UniqueEntityId(client.id.toString()),
			amount: new Money(100),
			category: new Category('Mercadinho'),
			date: new Date('2025-08-20'),
			description: 'Compras de casa',
		})

		client.addIncome(income)

		eventBus.dispatchEventsForAggregate(client.id as UniqueEntityId)
		await clientRepository.save(client)
		return { client, otherClient, income }
	}
})
