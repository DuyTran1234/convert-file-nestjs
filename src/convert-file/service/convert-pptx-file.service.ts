import { BadRequestException, Injectable } from "@nestjs/common";
import * as FormData from 'form-data';
import * as fs from 'node:fs';
import * as https from 'node:https';
import * as path from 'node:path';
import { ExtensionFile } from "src/shared/extension-file.enum";
import { TimeEnum } from "src/shared/time.enum";
import { ConvertFileEntity } from "../entity/convert-file.entity";
import { LocalStorageService } from "./local-storage.service";

@Injectable()
export class ConvertPptxFileService {
    constructor(
        private localStorageService: LocalStorageService
    ) { }
    public async convertPptxToPdf(pathFileUpload: string, fileNameUpload: string,
        userId: string, convertAccessToken: string): Promise<ConvertFileEntity> {
        try {
            const timer = new Date().getTime();
            const formData = new FormData();
            formData.append('document', fs.createReadStream(pathFileUpload));
            const convertFileName = `${path.parse(fileNameUpload).name}${ExtensionFile.PDF}`;
            const options = {
                hostname: 'api.aspose.cloud',
                path: `/v3.0/slides/convert/Pdf`,
                timeout: TimeEnum.TIMEOUT_REQUEST,
                method: 'post',
                headers: {
                    'accept': 'multipart/form-data',
                    'authorization': `Bearer ${convertAccessToken}`,
                    'Content-Type': 'multipart/form-data',
                    ...formData.getHeaders()
                }
            };
            const promise = new Promise<ConvertFileEntity>((resolve, reject) => {
                const request = https.request(options, (res) => {
                    let data = [];
                    res.on('data', (chunk) => { data.push(chunk); });
                    res.on('end', async () => {
                        if (res.statusCode === 200) {
                            const saveFilePath = await this.localStorageService.bufferToFile(data, convertFileName, userId);
                            const deleteFileUpload = await this.localStorageService.deleteFileUpload(pathFileUpload);
                            console.log(`total convertPptxToPdf: ${new Date().getTime() - timer}`);
                            resolve(saveFilePath);
                        }
                        else { reject(new BadRequestException(`convertPptxToPdf(ConvertPptxFileService) error`)) }
                    });
                });
                request.on('error', (error) => { reject(new BadRequestException(`${error?.message}`)) });
                request.on('timeout', () => { request.destroy() });
                formData.pipe(request);
            });
            return promise;
        } catch (error) {
            throw new BadRequestException(error?.message || `convertPptxToPdf(ConvertPptxFileService) error`);
        }
    }
}