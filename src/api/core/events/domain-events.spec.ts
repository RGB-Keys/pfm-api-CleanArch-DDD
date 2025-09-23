import { AggregateRoot } from '../entities/aggregate-root'
import { UniqueEntityId } from '../entities/value-objects/unique-entity-id'
import { DomainEvent } from './domain-event'
import { DomainEvents } from './domain-events'

class CustomAggregateCreated implements DomainEvent {
	public ocurredAt: Date
	private aggregate: CustomAggregate

	constructor(aggregate: CustomAggregate) {
		this.ocurredAt = new Date()
		this.aggregate = aggregate
	}
	occurredAt: Date
	name: string

	public getAggregateId(): UniqueEntityId {
		return this.aggregate.id as UniqueEntityId
	}
}

class CustomAggregate extends AggregateRoot {
	static create() {
		const aggregate = new CustomAggregate()

		aggregate.addDomainEvent(new CustomAggregateCreated(aggregate))

		return aggregate
	}
}

describe('Domain events', () => {
	it('should be able to dispatch and listen to events', () => {
		const callbackSpy = vi.fn()

		// Subscriber cadastrado (Ouvindo o evento de "Resposta Criada")
		DomainEvents.register(callbackSpy, CustomAggregateCreated.name)

		// Estou criando uma resposta, porém, SEM salvar no banco
		const aggregate = CustomAggregate.create()

		// Estou assegurando que o evento foi criado, porém, Não foi disparado
		expect(aggregate.domainEvents).toHaveLength(1)

		// Estou salvando a resposta no banco de dados e assim disparando o evento
		DomainEvents.dispatchEventsForAggregate(aggregate.id as UniqueEntityId)

		// O Subscriber ouve o evento e faz o que precisa ser feito com o dado
		expect(callbackSpy).toHaveBeenCalled()
		expect(aggregate.domainEvents).toHaveLength(0)
	})
})
