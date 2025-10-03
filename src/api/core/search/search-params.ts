export class SearchParams<T> {
	public readonly search?: string
	public readonly filters?: Partial<T>
	public readonly pagination: PaginationParams<T>

	constructor(
		input: {
			search?: string
			filters?: Partial<T>
			pagination?: Partial<PaginationParams<T>>
		} = {},
	) {
		this.search = input.search
		this.filters = input.filters
		this.pagination = {
			page: input.pagination?.page ?? 1,
			perPage: input.pagination?.perPage ?? 20,
			sortDir: input.pagination?.sortDir,
			sortFild: input.pagination?.sortFild,
		}
	}
}

interface PaginationParams<T> {
	page: number
	perPage: number
	sortDir?: 'asc' | 'desc'
	sortFild?: keyof T
}
