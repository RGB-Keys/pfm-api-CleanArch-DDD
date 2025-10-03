import { PaginationMeta } from '../types/meta'

export type OutputCollectionDTO<T> = {
	data: Array<T>
	meta: PaginationMeta
}
