import { BadRequestException, Body, Controller, Post, UploadedFiles, UseInterceptors, UsePipes } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ConvertTypeValidator } from "src/convert-file/validator/convert-type.validator";
import { SizeEnum } from "src/shared/size.enum";
import { ConvertTypeDto } from "../dto/convert-type.dto";
import { ConvertFileService } from "../service/convert-file.service";

@Controller('convert-file')
export class ConvertFileController {
    constructor(
        private convertFileService: ConvertFileService,
    ) { }

    @UsePipes(new ConvertTypeValidator())
    @UseInterceptors(FilesInterceptor('convert-files', SizeEnum.GUEST_MAX_FILE, {
        limits: {
            files: SizeEnum.GUEST_MAX_FILE,
            fileSize: SizeEnum.MAX_FILE_SIZE,
        },
    }))
    @Post('guest-convert')
    async guestConvertFile(@UploadedFiles() files: Array<Express.Multer.File>, @Body() convertTypeDto: ConvertTypeDto) {
        try {
            const userId = 'guest';
            const convertFile = await this.convertFileService.convertFile(files, convertTypeDto, userId);
            return convertFile;
        } catch (error) {
            if (error) { throw error; }
            throw new BadRequestException(`guestConvertFile ConvertFileController error`);
        }
    }
}