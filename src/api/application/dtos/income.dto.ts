import { Income } from '@/api/domain/entities/income.entity'

export class IncomeSummaryDTO {
	id!: Income['id']
	clientId!: Income['clientId']
	amount!: Income['amount']
	date!: Income['date']
	description?: Income['description']
	category?: Income['category']
	updatedAt?: Income['updatedAt']
}
