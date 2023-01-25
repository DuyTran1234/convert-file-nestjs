import { Module } from "@nestjs/common";
import { FileUploadController } from "./controller/file-upload.controller";
import { FileUploadService } from "./service/file-upload.service";

@Module({
    imports: [

    ],
    providers: [
        FileUploadService,
    ],
    controllers: [
        FileUploadController,
    ],
    exports: [
        FileUploadService,
    ],
})
export class FileUploadModule { }