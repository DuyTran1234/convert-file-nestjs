import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import * as dotenv from 'dotenv';
import * as https from 'node:https';
import * as path from 'node:path';
import { FileUploadService } from "src/file-upload/service/file-upload.service";
import { ConvertFileAction } from "src/shared/convert-file.enum";
import { ExtensionFile } from "src/shared/extension-file.enum";
import { ConvertTypeDto } from "../dto/convert-type.dto";
import { ConvertDocFileService } from "./convert-doc-file.service";
import { ConvertExcelFileService } from "./convert-excel-file.service";
import { ConvertPdfFileService } from "./convert-pdf-file.service";
import { ConvertPptxFileService } from "./convert-pptx-file.service";

dotenv.config();
@Injectable()
export class ConvertFileService {
    private convertAccessToken = null;
    private expireTime = 0;
    private readonly clientId = process.env.ASPOSE_CLIENT_ID;
    private readonly clientSecret = process.env.ASPOSE_CLIENT_SECRET;
    constructor(
        private convertPdfFileService: ConvertPdfFileService,
        private convertDocFileService: ConvertDocFileService,
        private convertExcelFileService: ConvertExcelFileService,
        private convertPptxFileService: ConvertPptxFileService,
        private fileUploadService: FileUploadService,
    ) { }
    private getConvertType(convertTypeDto: ConvertTypeDto, fileNameUploads: string[]) {
        let checkEx = false;
        switch (convertTypeDto?.type) {
            case ConvertFileAction.PDF_TO_DOC:
                checkEx = this.checkPdfFileExtension(fileNameUploads);
                return this.convertPdfFileService.convertPdfToDoc.bind(this.convertPdfFileService);
            case ConvertFileAction.PDF_TO_XLSX:
                checkEx = this.checkPdfFileExtension(fileNameUploads);
                return this.convertPdfFileService.convertPdfToExcel.bind(this.convertPdfFileService);
            case ConvertFileAction.PDF_TO_PPTX:
                checkEx = this.checkPdfFileExtension(fileNameUploads);
                return this.convertPdfFileService.convertPdfToPptx.bind(this.convertPdfFileService);
            case ConvertFileAction.PDF_TO_EPUB:
                checkEx = this.checkPdfFileExtension(fileNameUploads);
                return this.convertPdfFileService.convertPdfToEpub.bind(this.convertPdfFileService);
            case ConvertFileAction.DOC_TO_PDF:
                checkEx = this.checkDocFileExtension(fileNameUploads);
                return this.convertDocFileService.convertDocToPdf.bind(this.convertDocFileService);
            case ConvertFileAction.EXCEL_TO_PDF:
                checkEx = this.checkExcelFileExtension(fileNameUploads);
                return this.convertExcelFileService.convertExcelToPdf.bind(this.convertExcelFileService);
            case ConvertFileAction.PPTX_TO_PDF:
                checkEx = this.checkPptxFileExtension(fileNameUploads);
                return this.convertPptxFileService.convertPptxToPdf.bind(this.convertPptxFileService);
            default:
                throw new BadRequestException(`getConvertType(ConvertFileService) error`);
        }
    }
    public async convertFile(files: Array<Express.Multer.File>, convertTypeDto: ConvertTypeDto, userId: string) {
        try {
            const present = new Date().getTime();
            const fileNameUploads = files.map((item) => item.originalname);
            const convertTypeFunc = this.getConvertType(convertTypeDto, fileNameUploads);
            if (!this.convertAccessToken || present > this.expireTime) {
                this.convertAccessToken = await this.getAccessTokenConvert();
                this.expireTime = present + 3500 * 1000; // check expire time jwt token
            }
            const uploadFiles = await this.fileUploadService.writeFileUpload(files, userId);
            const resultConvertFiles = await Promise.all<string>(uploadFiles.map((item) => {
                return convertTypeFunc(item.pathFile, item.fileName, userId, this.convertAccessToken);
            }));
            if (resultConvertFiles.length > 0) { return resultConvertFiles; }
        } catch (error) {
            throw new NotFoundException(error?.message || 'convertFile (ConvertFileService) error');
        }
    }
    private async getAccessTokenConvert(): Promise<string> {
        try {
            const timer = new Date().getTime();
            const promise = new Promise<string>((resolve, reject) => {
                const options = {
                    hostname: 'api.aspose.cloud',
                    path: '/connect/token',
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                    },
                };
                const request = https.request(options, (res) => {
                    res.setEncoding('utf-8');
                    if (res.statusCode === 200 || res.statusCode === 201) {
                        res.on('data', (chunk) => {
                            const rs = JSON.parse(chunk);
                            console.log(`time get token: ${new Date().getTime() - timer}`);
                            resolve(rs.access_token);
                        });
                    }
                    else { reject(new NotFoundException(`getAccessTokenConvert (ConvertFileService) failed`)); }
                });
                request.write(`grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`);
                request.end();
            });
            return promise;
        } catch (error) {
            throw new NotFoundException(error?.message || `getAccessTokenConvert (ConvertFileService) failed`);
        }
    }
    private checkPdfFileExtension(fileNameUploads: string[]): boolean {
        try {
            const check = fileNameUploads.map((fileName) => path.parse(fileName).ext).every((extension) => {
                return extension.localeCompare(ExtensionFile.PDF) === 0;
            });
            if (check) { return true; }
            else {
                throw new BadRequestException(`checkPdfFileExtension(ConvertFileService) error: extension pdf file invalid`);
            }
        } catch (error) {
            throw new BadRequestException(error?.message ||
                `checkPdfFileExtension(ConvertFileService) error: extension file invalid`);
        }
    }
    private checkDocFileExtension(fileNameUploads: string[]): boolean {
        try {
            const check = fileNameUploads.map((fileName) => path.parse(fileName).ext).every((extension) => {
                return extension.localeCompare(ExtensionFile.DOC) === 0 || extension.localeCompare(ExtensionFile.DOCX) === 0;
            });
            if (check) { return true; }
            else {
                throw new BadRequestException(`checkDocFileExtension(ConvertFileService) error: extension msword file invalid`);
            }
        } catch (error) {
            throw new BadRequestException(error?.message ||
                `checkDocFileExtension(ConvertFileService) error: extension msword file invalid`);
        }
    }
    private checkExcelFileExtension(fileNameUploads: string[]): boolean {
        try {
            const check = fileNameUploads.map((fileName) => path.parse(fileName).ext).every((extension) => {
                return extension.localeCompare(ExtensionFile.XLS) === 0 || extension.localeCompare(ExtensionFile.XLSX) === 0;
            });
            if (check) { return true; }
            else {
                throw new BadRequestException(`checkExcelFileExtension(ConvertFileService) error: extension excel file invalid`);
            }
        } catch (error) {
            throw new BadRequestException(error?.message ||
                `checkExcelFileExtension(ConvertFileService) error: extension excel file invalid`);
        }
    }
    private checkPptxFileExtension(fileNameUploads: string[]): boolean {
        try {
            const check = fileNameUploads.map((fileName) => path.parse(fileName).ext).every((extension) => {
                return extension.localeCompare(ExtensionFile.PPTX) === 0;
            });
            if (check) { return true; }
            else {
                throw new BadRequestException(`checkPptxFileExtension(ConvertFileService) error: extension pptx file invalid`);
            }
        } catch (error) {
            throw new BadRequestException(error?.message ||
                `checkPptxFileExtension(ConvertFileService) error: extension pptx file invalid`);
        }
    }
}