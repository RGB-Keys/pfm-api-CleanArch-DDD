import {
	IncomeRepository,
	FindUniqueIncomeParams,
} from '@/api/application/repositories/income.repository'
import { Income } from '@/api/domain/entities/income.entity'

export class InMemoryIncomeRepository implements IncomeRepository {
	public items: Income[] = []

	async create(income: Income) {
		this.items.push(income)
	}

	async findUnique(params: FindUniqueIncomeParams) {
		const income = this.items.find(
			(item) => item.id.toString() === params.incomeId,
		)

		if (!income) return null

		return income
	}

	async save(income: Income) {
		const itemIndex = this.items.findIndex((item) => item.id === income.id)

		this.items[itemIndex] = income
	}

	async remove(income: Income) {
		const itemIndex = this.items.findIndex((item) => item.id === income.id)

		this.items.splice(itemIndex, 1)
	}
}
