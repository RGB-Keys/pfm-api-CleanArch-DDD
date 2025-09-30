import { AggregateRoot } from '@/api/core/entities/aggregate-root'
import { UniqueEntityId } from '@/api/core/entities/value-objects/unique-entity-id'
import { Optional } from '@/api/core/types/optional'
import { validateProps } from '@/api/core/utils/validateProps.utils'
import { validateString } from '@/api/core/utils/validateString.utils'
import { UserRole } from '../enums/user/role'

export interface UserProps {
	email: User['email']
	passwordHash: User['passwordHash']
	role: User['role']
	avatarUrl?: User['avatarUrl']
	createdAt: User['createdAt']
	updatedAt?: User['updatedAt']
}

export class User extends AggregateRoot {
	public email: string
	public passwordHash: string
	public role: UserRole
	public avatarUrl?: string | null
	public createdAt: Date
	public updatedAt?: Date | null

	protected constructor(
		input: Optional<UserProps, 'createdAt' | 'role'>,
		id?: UniqueEntityId,
	) {
		super(id)

		this.email = input.email
		this.passwordHash = input.passwordHash
		this.role = input.role ?? UserRole.CLIENT
		this.avatarUrl = input.avatarUrl
		this.createdAt = input.createdAt ?? new Date()
		this.updatedAt = input.updatedAt
	}

	static restoure(input: UserProps, id?: UniqueEntityId): User {
		return new User(input, id)
	}

	protected updateUserProps(props: {
		email?: User['email']
		passwordHash?: User['passwordHash']
		avatarUrl?: User['avatarUrl']
	}) {
		const updates: Partial<User> = {}

		if (props.email && props.email !== this.email) {
			validateString(props.email, 'Email')
			updates.email = props.email
		}

		if (props.passwordHash && props.passwordHash !== this.passwordHash) {
			validateString(props.passwordHash, 'PasswordHash')
			updates.passwordHash = props.passwordHash
		}

		if (props.avatarUrl !== undefined && props.avatarUrl !== this.avatarUrl) {
			updates.avatarUrl = props.avatarUrl
		}

		if (Object.keys(updates).length > 0) {
			Object.assign(this, updates)
			this.updatedAt = new Date()
		}
	}

	protected validate() {
		validateProps(
			[
				() => (!this.email ? 'email is missing or empty' : null),
				() => (!this.passwordHash ? 'passwordHash is missing or empty' : null),
				() =>
					!Object.values(UserRole).includes(this.role)
						? `role is invalid (received: ${this.role})`
						: null,
			],
			{
				email: this.email,
				passwordHash: this.passwordHash ? '***' : undefined,
				role: this.role,
			},
		)
	}
}
