import { forwardRef, Module } from "@nestjs/common";
import { FileUploadModule } from "src/file-upload/file-upload.module";
import { ConvertFileController } from "./controller/convert-file.controller";
import { ConvertDocFileService } from "./service/convert-doc-file.service";
import { ConvertExcelFileService } from "./service/convert-excel-file.service";
import { ConvertFileService } from "./service/convert-file.service";
import { ConvertPdfFileService } from "./service/convert-pdf-file.service";
import { ConvertPptxFileService } from "./service/convert-pptx-file.service";
import { LocalStorageService } from "./service/local-storage.service";

@Module({
    imports: [
        FileUploadModule,
    ],
    providers: [
        ConvertFileService,
        ConvertPdfFileService,
        ConvertDocFileService,
        ConvertExcelFileService,
        ConvertPptxFileService,
        LocalStorageService,
    ],
    controllers: [
        ConvertFileController,
    ],
})
export class ConvertFileModule { }