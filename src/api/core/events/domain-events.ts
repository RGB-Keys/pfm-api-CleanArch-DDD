import { AggregateRoot } from '../entities/aggregate-root'
import { UniqueEntityId } from '../entities/value-objects/unique-entity-id'
import { DomainEvent } from './domain-event'

type DomainEventCallBack = (event: unknown) => void

export class DomainEvents {
	private static handlersMap: Record<string, DomainEventCallBack[]> = {}
	private static markedAggregates: AggregateRoot[] = []

	public static markAggregateForDispatch(aggregate: AggregateRoot) {
		const aggregateFound = !!this.findMarkedAggreateById(aggregate.id)

		if (!aggregateFound) {
			this.markedAggregates.push(aggregate)
		}
	}

	private static dispatchAggregateEvents(aggregate: AggregateRoot) {
		aggregate.domainEvents.forEach((event: DomainEvent) => this.dispatch(event))
	}

	private static removeAggregateFromMarkedDispatchList(
		aggregate: AggregateRoot,
	) {
		const index = this.markedAggregates.findIndex((a) => a.equals(aggregate))

		this.markedAggregates.splice(index, 1)
	}

	private static findMarkedAggreateById(
		id: UniqueEntityId,
	): AggregateRoot | undefined {
		return this.markedAggregates.find((aggregate) => aggregate.id.equals(id))
	}

	public static dispatchEventsForAggregate(id: UniqueEntityId) {
		const aggregate = this.findMarkedAggreateById(id)

		if (aggregate) {
			this.dispatchAggregateEvents(aggregate)
			aggregate.clearEvents()
			this.removeAggregateFromMarkedDispatchList(aggregate)
		}
	}

	public static register(
		callback: DomainEventCallBack,
		eventClassName: string,
	) {
		const wasEventRegisteredBefore = eventClassName in this.handlersMap

		if (!wasEventRegisteredBefore) {
			this.handlersMap[eventClassName] = []
		}

		this.handlersMap[eventClassName].push(callback)
	}

	public static clearHandlers() {
		this.handlersMap = {}
	}

	public static clearMarkedAggregates() {
		this.markedAggregates = []
	}

	private static dispatch(event: DomainEvent) {
		const eventClassName: string = event.constructor.name

		const isEventRegistered = eventClassName in this.handlersMap

		if (isEventRegistered) {
			const handlers = this.handlersMap[eventClassName]

			for (const handler of handlers) {
				handler(event)
			}
		}
	}
}
