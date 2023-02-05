import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: [
			process.env.CLIENT_SERVER,
			process.env.CLIENT_LOCALHOST,
		],
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		preflightContinue: false,
		optionsSuccessStatus: 204,
	});
	const server = await app.listen(process.env.PORT);
}
bootstrap();
