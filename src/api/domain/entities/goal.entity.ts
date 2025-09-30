import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { Money } from './value-objects/money.value-object'
import { validateProps } from '@/api/core/utils/validateProps.utils'
import { Optional } from '@/api/core/types/optional'
import { ValidationError } from '@/api/core/errors/domain/validation-error.domain-error'
import { AggregateRoot } from '@/api/core/entities/aggregate-root'
import { GoalReachedEvent } from '../events/goal/goal-reached.event'
import { GoalContributedEvent } from '../events/goal/goal-contribute.event'

export interface GoalProps {
	clientId: Goal['clientId']
	target: Goal['target']
	deadline?: Goal['deadline']
	saved: Goal['saved']
	createdAt: Goal['createdAt']
	updatedAt?: Goal['updatedAt']
}

export class Goal extends AggregateRoot {
	readonly clientId: UniqueEntityId
	public target: Money
	public deadline?: Date | null
	public saved: Money
	public createdAt: Date
	public updatedAt?: Date | null

	private constructor(
		input: Optional<GoalProps, 'createdAt' | 'saved'>,
		id?: UniqueEntityId,
	) {
		super(id)

		this.clientId = input.clientId
		this.target = input.target
		this.deadline = input.deadline ?? null
		this.saved = input.saved ?? new Money(0)
		this.createdAt = input.createdAt ?? new Date()
		this.updatedAt = input.updatedAt ?? null

		this.validate()
	}

	public progressPercent(): number {
		return Math.min(
			100,
			Math.round((this.saved.amount / this.target.amount) * 100),
		)
	}

	public contribute(amount: Money): void {
		const updated = this.saved.add(amount)

		if (updated.value > this.target.value) {
			throw new ValidationError('Contribution exceeds target amount.')
		}

		this.saved = updated
		this.updatedAt = new Date()

		this.addDomainEvent(
			new GoalContributedEvent(
				this.id as UniqueEntityId,
				this.clientId,
				this.saved,
			),
		)

		if (this.saved.equals(this.target)) {
			this.addDomainEvent(
				new GoalReachedEvent(
					this.id as UniqueEntityId,
					this.clientId,
					this.target,
				),
			)
		}
	}

	static create(args: GoalCreateArgs, id?: UniqueEntityId): Goal {
		return new Goal(
			{
				...args,
				deadline: args.deadline ?? null,
				saved: args.saved ?? new Money(0),
				createdAt: args.createdAt ?? new Date(),
			},
			id,
		)
	}

	static restore(
		input: Optional<GoalProps, 'createdAt'>,
		id?: UniqueEntityId,
	): Goal {
		return new Goal({ ...input, createdAt: input.createdAt ?? new Date() }, id)
	}

	private validate() {
		validateProps(
			[
				() => (!this.clientId ? 'clientId is missing or empty' : null),
				() => (!this.target ? 'target is missing or empty' : null),
			],
			{
				target: this.target,
				saved: this.saved,
				deadline: this.deadline,
			},
		)
	}
}

type GoalCreateArgs = Optional<GoalProps, 'deadline' | 'saved' | 'createdAt'>
