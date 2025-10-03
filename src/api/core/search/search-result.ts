import { PaginationMeta } from '../types/meta'

export type SearchResult<T> = {
	data: Array<T>
	meta: PaginationMeta
}
