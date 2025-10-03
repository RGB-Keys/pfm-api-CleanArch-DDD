import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { ValidationError } from '@/api/core/errors/domain/validation-error.domain-error'
import { Optional } from '@/api/core/types/optional'
import { validateProps } from '@/api/core/utils/validateProps.utils'
import { validateString } from '@/api/core/utils/validateString.utils'
import { UserRole } from '../enums/user/role'
import { BalanceUpdatedEvent } from '../events/client/balanceUpdated.event'
import { ExpenseAddedEvent } from '../events/expense/expense-added.event'
import { ExpenseRemovedEvent } from '../events/expense/expense-removed.event'
import { GoalAddedEvent } from '../events/goal/goal-added.event'
import { GoalContributedEvent } from '../events/goal/goal-contribute.event'
import { GoalReachedEvent } from '../events/goal/goal-reached.event'
import { GoalRemovedEvent } from '../events/goal/goal-removed.event'
import { IncomeAddedEvent } from '../events/income/income-added.event'
import { IncomeRemovedEvent } from '../events/income/income-removed.event'
import { Expense } from './expense.entity'
import { Goal } from './goal.entity'
import { Income } from './income.entity'
import { User, UserProps } from './user.entity'
import { Money } from './value-objects/money.value-object'
import { ExpenseList } from './watched-lists/expense.watched-list'
import { GoalList } from './watched-lists/goal.watched-list'
import { IncomeList } from './watched-lists/income.watched-list'

export interface ClientProps extends UserProps {
	name: Client['name']
	phoneNumber?: Client['phoneNumber']
	monthlyIncome?: Client['monthlyIncome']
	incomes: Client['incomes']
	expenses: Client['expenses']
	goals: Client['goals']
}

export class Client extends User {
	public name: string
	public phoneNumber?: string | null
	public monthlyIncome?: Money | null
	public incomes: IncomeList
	public expenses: ExpenseList
	public goals: GoalList

	private constructor(
		input: Omit<
			ClientProps,
			'monthlyIncome' | 'incomes' | 'expenses' | 'goals'
		>,
		id?: UniqueEntityId,
	) {
		super(
			{
				email: input.email,
				passwordHash: input.passwordHash,
				role: UserRole.CLIENT,
				updatedAt: input.updatedAt,
			},
			id,
		)
		this.name = input.name
		this.phoneNumber = input.phoneNumber ?? null
		this.monthlyIncome = new Money(0)
		this.incomes = new IncomeList([])
		this.expenses = new ExpenseList([])
		this.goals = new GoalList([])

		this.validate()
	}

	public updateUserProps(props: ClientUpdateArgs) {
		super.updateUserProps({
			avatarUrl: props.avatarUrl,
			email: props.email,
			passwordHash: props.passwordHash,
		})

		const updates: Partial<Client> = {}

		if (props.name && props.name !== this.name) {
			validateString(props.name, 'Name')
			updates.name = props.name
		}

		if (props.phoneNumber && props.phoneNumber !== this.phoneNumber) {
			validateString(props.phoneNumber, 'PhoneNumber')
			updates.phoneNumber = props.phoneNumber
		}

		if (Object.keys(updates).length > 0) {
			Object.assign(this, updates)
			this.touch()
		}
	}

	public setMonthlyIncome(amount: Money) {
		if (!amount || amount.value.amountInCents < 0) {
			throw new ValidationError('Monthly income cannot be negative')
		}

		this.monthlyIncome = amount
		this.touch()
	}

	public addIncome(income: Income) {
		if (!income.clientId.equals(this.id))
			throw new ValidationError('income belongs to other client')
		this.incomes.add(income)

		this.touch()

		this.addDomainEvent(
			new IncomeAddedEvent(
				new UniqueEntityId(income.id.toString()),
				new UniqueEntityId(this.id.toString()),
				income.amount,
				income.date,
				income.category,
				income.description,
			),
		)

		this.addDomainEvent(
			new BalanceUpdatedEvent(
				new UniqueEntityId(this.id.toString()),
				this.balance(),
			),
		)
	}

	public removeIncome(income: Income) {
		this.incomes.remove(income)
		this.touch()

		this.addDomainEvent(
			new IncomeRemovedEvent(
				new UniqueEntityId(income.id.toString()),
				new UniqueEntityId(this.id.toString()),
			),
		)

		this.addDomainEvent(
			new BalanceUpdatedEvent(
				new UniqueEntityId(this.id.toString()),
				this.balance(),
			),
		)
	}

	public addExpense(expense: Expense) {
		if (!expense.clientId.equals(this.id))
			throw new ValidationError('expense belongs to other client')

		const availableBalance = this.balance()

		if (expense.amount.value > availableBalance.value) {
			throw new ValidationError('Expense exceeds available balance')
		}

		this.expenses.add(expense)
		this.touch()

		this.addDomainEvent(
			new ExpenseAddedEvent(
				new UniqueEntityId(expense.id.toString()),
				new UniqueEntityId(this.id.toString()),
				expense.amount,
				expense.date,
				expense.category,
				expense.description,
			),
		)

		this.addDomainEvent(
			new BalanceUpdatedEvent(
				new UniqueEntityId(this.id.toString()),
				this.balance(),
			),
		)
	}

	public removeExpense(expense: Expense) {
		this.expenses.remove(expense)
		this.touch()

		this.addDomainEvent(
			new ExpenseRemovedEvent(
				new UniqueEntityId(expense.id.toString()),
				new UniqueEntityId(this.id.toString()),
			),
		)

		this.addDomainEvent(
			new BalanceUpdatedEvent(
				new UniqueEntityId(this.id.toString()),
				this.balance(),
			),
		)
	}

	public addGoal(goal: Goal) {
		if (!goal.clientId.equals(this.id))
			throw new ValidationError('goal belongs to other client')
		this.goals.add(goal)

		this.touch()

		this.addDomainEvent(
			new GoalAddedEvent(
				goal.id as UniqueEntityId,
				this.id as UniqueEntityId,
				goal.saved,
				goal.target,
				goal.startedAt,
				goal.endedAt,
			),
		)

		this.addDomainEvent(
			new GoalContributedEvent(
				new UniqueEntityId(goal.id.toString()),
				new UniqueEntityId(this.id.toString()),
				goal.saved,
			),
		)
	}

	public removeGoal(goal: Goal) {
		this.goals.remove(goal)
		this.touch()

		this.addDomainEvent(
			new GoalRemovedEvent(
				new UniqueEntityId(goal.id.toString()),
				new UniqueEntityId(this.id.toString()),
			),
		)

		this.addDomainEvent(
			new BalanceUpdatedEvent(
				new UniqueEntityId(this.id.toString()),
				this.balance(),
			),
		)
	}

	public contribute(goal: Goal, amount: Money): void {
		const updated = goal.saved.add(amount)

		if (updated.value > goal.target.value) {
			throw new ValidationError('Contribution exceeds target amount.')
		}

		goal.saved = updated
		goal.updatedAt = new Date()
		this.touch()

		this.addDomainEvent(
			new GoalContributedEvent(
				goal.id as UniqueEntityId,
				this.id as UniqueEntityId,
				goal.saved,
			),
		)

		if (goal.saved.equals(goal.target)) {
			this.addDomainEvent(
				new GoalReachedEvent(
					goal.id as UniqueEntityId,
					this.id as UniqueEntityId,
					goal.target,
				),
			)
		}
	}

	private balance(): Money {
		const safeAmount = (amount?: Money | null) => {
			if (!amount) return new Money(0)
			return amount
		}

		const totalIncomes = this.incomes.items.reduce(
			(sum, i) => sum.add(safeAmount(i.amount)),
			new Money(0),
		)
		const totalExpenses = this.expenses.items.reduce(
			(sum, e) => sum.add(safeAmount(e.amount)),
			new Money(0),
		)

		const baseIncome = safeAmount(this.monthlyIncome)

		return baseIncome.add(totalIncomes).subtract(totalExpenses)
	}

	private touch() {
		this.updatedAt = new Date()
	}

	static create(args: ClientCreateArgs, id?: UniqueEntityId) {
		return new Client(
			{
				...args,
				role: UserRole.CLIENT,
				createdAt: new Date(),
			},
			id,
		)
	}

	static restore(input: ClientProps, id?: UniqueEntityId): Client {
		return new Client(input, id)
	}

	protected validate() {
		super.validate()

		validateProps([() => (!this.name ? 'name is missing or empty' : null)], {
			name: this.name,
			email: this.email,
			phoneNumber: this.phoneNumber,
		})
	}
}

type ClientCreateArgs = Omit<
	ClientProps,
	'incomes' | 'goals' | 'expenses' | 'role' | 'createdAt'
>

type ClientUpdateArgs = Optional<
	ClientProps,
	| 'name'
	| 'email'
	| 'avatarUrl'
	| 'passwordHash'
	| 'phoneNumber'
	| 'role'
	| 'monthlyIncome'
	| 'createdAt'
	| 'expenses'
	| 'goals'
	| 'incomes'
>
