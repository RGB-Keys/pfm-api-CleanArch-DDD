import { Entity } from '@/api/core/entities/entity'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { Optional } from '@/api/core/types/optional'
import { validateProps } from '@/api/core/utils/validateProps.utils'
import { Money } from './value-objects/money.value-object'

export interface GoalProps {
	clientId: Goal['clientId']
	target: Goal['target']
	endedAt?: Goal['endedAt']
	saved: Goal['saved']
	startedAt: Goal['startedAt']
	updatedAt?: Goal['updatedAt']
}

export class Goal extends Entity {
	readonly clientId: UniqueEntityId
	public target: Money
	public endedAt?: Date | null
	public saved: Money
	public startedAt: Date
	public updatedAt?: Date | null

	private constructor(input: GoalProps, id?: UniqueEntityId) {
		super(id)

		this.clientId = input.clientId
		this.target = input.target
		this.endedAt = input.endedAt ?? null
		this.saved = input.saved ?? new Money(0)
		this.startedAt = input.startedAt ?? new Date()
		this.updatedAt = input.updatedAt ?? null

		this.validate()
	}

	public progressPercent(): number {
		return Math.min(
			100,
			Math.round((this.saved.amount / this.target.amount) * 100),
		)
	}

	static create(args: GoalCreateArgs, id?: UniqueEntityId): Goal {
		return new Goal(
			{
				...args,
				endedAt: args.endedAt ?? null,
				saved: args.saved ?? new Money(0),
				startedAt: args.startedAt ?? new Date(),
			},
			id,
		)
	}

	static restore(
		input: Optional<GoalProps, 'startedAt' | 'endedAt'>,
		id?: UniqueEntityId,
	): Goal {
		return new Goal({ ...input, startedAt: input.startedAt ?? new Date() }, id)
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
				endedAt: this.endedAt,
			},
		)
	}
}

type GoalCreateArgs = Optional<GoalProps, 'endedAt' | 'saved' | 'startedAt'>
