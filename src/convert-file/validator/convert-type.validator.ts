import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ConvertTypeDto } from "src/convert-file/dto/convert-type.dto";
import { MessageError } from "src/shared/message-error.service";

@Injectable()
export class ConvertTypeValidator implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        try {
            if (metadata.metatype === ConvertTypeDto) {
                value.type = Number.parseInt(value.type);
                const obj = plainToInstance(ConvertTypeDto, value);
                const errors = await validate(obj, {
                    whitelist: true,
                    forbidNonWhitelisted: true,
                });
                if (errors.length > 0) {
                    const msg = await MessageError.getErrorMessage(errors);
                    throw new BadRequestException(msg);
                }
                return obj;
            }
            else {
                return value;
            }
        } catch (error) {
            throw new BadRequestException(error?.message || `ConvertTypeValidator error`);
        }
    }
}