import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { MessageError } from "src/shared/message-error.service";

@Injectable()
export class CreateUserValidator implements PipeTransform {
    async transform(value: any, { metatype }: ArgumentMetadata) {
        try {
            const object = plainToInstance(metatype, value);
            const errors = await validate(object, {
                skipMissingProperties: true,
                whitelist: true,
                forbidNonWhitelisted: true,
            });
            if (errors.length > 0) {
                const firstError = await MessageError.getErrorMessage(errors);
                throw new BadRequestException(`${firstError} (validator)`);
            }
            return object;
        } catch (error) {
            throw new BadRequestException(error?.message || `CreateUserValidator error`);
        }
    }
}