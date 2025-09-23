export interface EntityId {
	toValue(): unknown
	toString(): string
	equals(id: EntityId): boolean
}
