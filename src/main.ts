import { NestFactory } from '@nestjs/core'
import { DomainErrorFilter } from './api/infra/errors/domain-error-filter'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	app.useGlobalFilters(new DomainErrorFilter())

	await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
