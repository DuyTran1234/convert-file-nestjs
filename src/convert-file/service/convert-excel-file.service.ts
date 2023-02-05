import { BadRequestException, Injectable } from "@nestjs/common";
import * as dotenv from 'dotenv';
import * as FormData from 'form-data';
import * as https from 'https';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ExtensionFile } from "src/shared/extension-file.enum";
import { TimeEnum } from "src/shared/time.enum";
import { ConvertFileEntity } from "../entity/convert-file.entity";
import { LocalStorageService } from "./local-storage.service";

dotenv.config();
@Injectable()
export class ConvertExcelFileService {
    constructor(
        private localStorageService: LocalStorageService,
    ) { }
    private async uploadFileExcelToStorage(pathFileUpload: string, fileNameUpload: string,
        userId: string, convertAccessToken: string): Promise<string> {
        try {
            const timer = new Date().getTime();
            const formData = new FormData();
            formData.append('file', fs.createReadStream(pathFileUpload));
            const options = {
                timeout: TimeEnum.TIMEOUT_REQUEST,
                hostname: 'api.aspose.cloud',
                path: `/v3.0/cells/storage/file/${fileNameUpload}`,
                method: 'put',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'accept': 'application/json',
                    'Authorization': `Bearer ${convertAccessToken}`,
                    ...formData.getHeaders(),
                },
            };
            const promise = new Promise<string>((resolve, reject) => {
                const request = https.request(options, async (res) => {
                    if (res.statusCode === 200 || res.statusCode === 201) {
                        if (userId.localeCompare('guest') === 0) {
                            const deleteFileUpload = await this.localStorageService.deleteFileUpload(pathFileUpload);
                        }
                        console.log(`time uploadFileExcelToStorage: ${new Date().getTime() - timer}`);
                        resolve(fileNameUpload);
                    }
                    else { reject(new BadRequestException(`uploadFileExcelToStorage(ConvertExcelFileService) error`)); }
                });
                request.on('error', (error) => { reject(new BadRequestException(`${error?.message}`)); });
                request.on('timeout', () => { request.destroy(); });
                formData.pipe(request);
            });
            return promise;
        } catch (error) {
            throw new BadRequestException(error?.message || `uploadFileExcelToStorage(ConvertExcelFileService) error`);
        }
    }
    public async convertExcelToPdf(pathFileUpload: string, fileNameUpload: string,
        userId: string, convertAccessToken: string): Promise<ConvertFileEntity> {
        try {
            const timer = new Date().getTime();
            const uploadExcelFile = await this.uploadFileExcelToStorage(pathFileUpload, fileNameUpload, userId, convertAccessToken);
            const convertFileName = `${path.parse(fileNameUpload).name}${ExtensionFile.PDF}`;
            const options = {
                hostname: 'api.aspose.cloud',
                path: `/v3.0/cells/${uploadExcelFile}?format=PDF`,
                timeout: TimeEnum.TIMEOUT_REQUEST,
                method: 'get',
                headers: {
                    'accept': 'application/json',
                    'authorization': `Bearer ${convertAccessToken}`,
                }
            };
            const promise = new Promise<ConvertFileEntity>((resolve, reject) => {
                const request = https.request(options, (res) => {
                    let data = [];
                    res.on('data', (chunk) => { data.push(chunk); });
                    res.on('end', async () => {
                        if (res.statusCode === 200) {
                            const saveFilePath = await this.localStorageService.bufferToFile(data, convertFileName, userId);
                            console.log(`total convertExcelToPdf: ${new Date().getTime() - timer}`);
                            resolve(saveFilePath);
                        }
                        else { reject(new BadRequestException(`convertExcelToPdf(ConvertExcelFileService) error`)) }
                    });
                });
                request.on('error', (error) => { reject(new BadRequestException(`${error?.message}`)) });
                request.on('timeout', () => { request.destroy() });
                request.end();
            });
            return promise;
        } catch (error) {
            throw new BadRequestException(error?.message || `convertExcelToPdf(ConvertExcelFileService) error`);
        }
    }
}