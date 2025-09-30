import { Income } from '@/api/domain/entities/income.entity'

export abstract class IncomeRepository {
	abstract create(income: Income): Promise<void>
	abstract findUnique(params: FindUniqueIncomeParams): Promise<Income | null>
	abstract save(income: Income): Promise<void>
	abstract remove(income: Income): Promise<void>
}

export interface FindUniqueIncomeParams {
	incomeId?: string
}
