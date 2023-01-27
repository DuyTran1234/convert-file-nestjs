import { BadRequestException, Body, Controller, Post, Request, UploadedFiles, UseGuards, UseInterceptors, UsePipes } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
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
            throw new BadRequestException(error?.message || `guestConvertFile ConvertFileController error`);
        }
    }

    @UsePipes(new ConvertTypeValidator())
    @UseInterceptors(FilesInterceptor('convert-files', SizeEnum.USER_MAX_FILE, {
        limits: {
            files: SizeEnum.USER_MAX_FILE,
            fileSize: SizeEnum.MAX_FILE_SIZE,
        },
    }))
    @UseGuards(JwtAuthGuard)
    @Post('user-convert')
    async userConvertFile(@UploadedFiles() files: Array<Express.Multer.File>,
        @Body() convertTypeDto: ConvertTypeDto, @Request() req: any) {
        try {
            const userId = req.user?._id || 'guest';
            console.log(userId);
            const convertFile = await this.convertFileService.convertFile(files, convertTypeDto, userId);
            return convertFile;
        } catch (error) {
            if (error) { throw error; }
            throw new BadRequestException(error?.message || `guestConvertFile ConvertFileController error`);
        }
    }
}