import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { Optional } from '@/api/core/types/optional'
import { validateProps } from '@/api/core/utils/validateProps.utils'
import { validateString } from '@/api/core/utils/validateString.utils'
import { UserRole } from './enums/user/role'
import { User, UserProps } from './user.entity'
import { Income } from './income.entity'
import { Expense } from './expense.entity'
import { Goal } from './goal.entity'
import { IncrementalEntityId } from '@/api/core/entities/value-objects/incremental-entity-id'
import { ExpenseAddedEvent } from '../events/expense/expense-added.event'
import { IncomeRegisteredEvent } from '../events/income/income-registered.event'
import { GoalContributedEvent } from '../events/goal/goal-contribute.event'

export interface ClientProps extends UserProps {
	name: Client['name']
	phoneNumber?: Client['phoneNumber']
	incomes: Client['incomes']
	expenses: Client['expenses']
	goals: Client['goals']
}

export class Client extends User {
	public name: string
	public phoneNumber?: string | null
	public incomes: Income[] = []
	public expenses: Expense[] = []
	public goals: Goal[] = []

	private constructor(input: ClientProps, id?: UniqueEntityId) {
		super(
			{
				email: input.email,
				passwordHash: input.passwordHash,
			},
			id,
		)
		this.name = input.name
		this.phoneNumber = input.phoneNumber
		if (input.incomes) this.incomes = input.incomes
		if (input.expenses) this.expenses = input.expenses
		if (input.goals) this.goals = input.goals

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
			this.updatedAt = new Date()
		}
	}

	public addIncome(income: Income) {
		if (income.clientId !== this.id)
			throw new Error('income belongs to other client')
		this.incomes.push(income)

		this.addDomainEvent(
			new IncomeRegisteredEvent(
				income.id as IncrementalEntityId,
				this.id as UniqueEntityId,
				income.amount.value,
			),
		)
	}

	public addExpense(expense: Expense) {
		if (expense.clientId !== this.id)
			throw new Error('expense belongs to other client')
		this.expenses.push(expense)

		this.addDomainEvent(
			new ExpenseAddedEvent(
				expense.id as IncrementalEntityId,
				this.id as UniqueEntityId,
				expense.amount.value,
			),
		)
	}

	public addGoal(goal: Goal) {
		if (goal.clientId !== this.id)
			throw new Error('goal belongs to other client')
		this.goals.push(goal)

		this.addDomainEvent(
			new GoalContributedEvent(
				goal.id as IncrementalEntityId,
				this.id as UniqueEntityId,
				goal.saved.value,
			),
		)
	}

	public balance(): number {
		const totalIn = this.incomes.reduce((s, i) => s + i.amount.value, 0)
		const totalOut = this.expenses.reduce((s, e) => s + e.amount.value, 0)
		return (totalIn - totalOut) / 100
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
	'monthlyIncome' | 'role' | 'createdAt'
>

type ClientUpdateArgs = Optional<
	ClientProps,
	| 'name'
	| 'email'
	| 'avatarUrl'
	| 'passwordHash'
	| 'phoneNumber'
	| 'role'
	| 'createdAt'
>
