// src/api/core/entities/watched-list.ts
export abstract class WatchedList<T> {
	private current: T[]
	private initial: T[]
	private new: T[]
	private removedFromInitial: T[]
	private removedNew: T[]

	constructor(initialItems?: T[]) {
		this.current = initialItems ? [...initialItems] : []
		this.initial = initialItems ? [...initialItems] : []
		this.new = []
		this.removedFromInitial = []
		this.removedNew = []
	}

	protected abstract compareItems(a: T, b: T): boolean

	get items(): T[] {
		return this.current
	}

	add(item: T): void {
		const exists = this.current.some((x) => this.compareItems(x, item))
		if (!exists) {
			this.current.push(item)
			if (!this.initial.some((x) => this.compareItems(x, item))) {
				this.new.push(item)
			}
		}
	}

	//TODO: Observar se há realmente necessidade de manter dois remove.

	remove(item: T): void {
		const existsInCurrent = this.current.some((x) => this.compareItems(x, item))
		if (!existsInCurrent) return // nada a remover

		this.current = this.current.filter((x) => !this.compareItems(x, item))

		// Se o item fazia parte da lista inicial → removedFromInitial
		if (this.initial.some((x) => this.compareItems(x, item))) {
			if (!this.removedFromInitial.some((x) => this.compareItems(x, item))) {
				this.removedFromInitial.push(item)
			}
		}

		// Se o item foi adicionado em runtime → removedNew
		if (this.new.some((x) => this.compareItems(x, item))) {
			this.new = this.new.filter((x) => !this.compareItems(x, item))
			if (!this.removedNew.some((x) => this.compareItems(x, item))) {
				this.removedNew.push(item)
			}
		}
	}

	get newItems(): T[] {
		return this.new
	}

	get removedItems(): T[] {
		// caso queira unificado
		return [...this.removedFromInitial, ...this.removedNew]
	}

	get removedFromInitialItems(): T[] {
		return this.removedFromInitial
	}

	get removedNewItems(): T[] {
		return this.removedNew
	}
}
