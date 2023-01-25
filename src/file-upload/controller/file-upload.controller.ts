import { BadRequestException, Controller, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { SizeEnum } from "src/shared/size.enum";
import { FileUploadService } from "../service/file-upload.service";

@Controller('upload-file')
export class FileUploadController {
    constructor(
        private readonly fileUploadService: FileUploadService,
    ) { }

    @UseInterceptors(FilesInterceptor('user-upload-files', SizeEnum.USER_MAX_FILE, {
        limits: {
            fileSize: SizeEnum.MAX_FILE_SIZE,
            files: SizeEnum.USER_MAX_FILE,
        },
    }))
    @UseGuards(JwtAuthGuard)
    @Post('user-file')
    async userUploadFile(@UploadedFiles() files: Array<Express.Multer.File>, @Req() req: any) {
        try {
            const rs = await this.fileUploadService.writeFileUpload(files, req.user?._id);
            return rs;
        } catch (error) {
            throw new BadRequestException(error?.message || `userUploadFile(FileUploadController) error`);
        }
    }
}