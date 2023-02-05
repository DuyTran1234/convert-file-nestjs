import { BadRequestException, Injectable } from "@nestjs/common";
import * as FormData from 'form-data';
import * as fs from 'node:fs';
import * as https from 'node:https';
import * as path from 'node:path';
import { ExtensionFile } from "src/shared/extension-file.enum";
import { Role } from "src/shared/role.enum";
import { TimeEnum } from "src/shared/time.enum";
import { ConvertFileEntity } from "../entity/convert-file.entity";
import { LocalStorageService } from "./local-storage.service";

@Injectable()
export class ConvertDocFileService {
    constructor(
        private localStorageService: LocalStorageService
    ) { }
    private async uploadFileDocToStorage(pathFileUpload: string, fileNameUpload: string,
        userId: string, convertAccessToken: string): Promise<string> {
        try {
            const timer = new Date().getTime();
            const formData = new FormData();
            formData.append('fileContent', fs.createReadStream(pathFileUpload));
            const options = {
                timeout: TimeEnum.TIMEOUT_REQUEST,
                hostname: 'api.aspose.cloud',
                path: `/v4.0/words/storage/file/${fileNameUpload}`,
                method: 'put',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${convertAccessToken}`,
                    ...formData.getHeaders(),
                },
            };
            const promise = new Promise<string>((resolve, reject) => {
                const request = https.request(options, async (res) => {
                    if (res.statusCode === 200 || res.statusCode === 201) {
                        if (userId.localeCompare(Role.GUEST) === 0) {
                            const deleteFileUpload = await this.localStorageService.deleteFileUpload(pathFileUpload);
                        }
                        console.log(`time uploadFileDocToStorage: $${new Date().getTime() - timer}`);
                        resolve(fileNameUpload);
                    }
                    else { reject(new BadRequestException(`uploadFileDocToStorage(ConvertDocFileService) error`)); }
                });
                request.on('error', (error) => { reject(new BadRequestException(`${error?.message}`)); });
                request.on('timeout', () => request.destroy());
                formData.pipe(request);
            });
            return promise
        } catch (error) {
            throw new BadRequestException(error?.message || `uploadFileDocToStorage(ConvertDocFileService) error`);
        }
    }
    public async convertDocToPdf(pathFileUpload: string, fileNameUpload: string,
        userId: string, convertAccessToken: string): Promise<ConvertFileEntity> {
        try {
            const timer = new Date().getTime();
            const uploadFileStorage = await this.uploadFileDocToStorage(pathFileUpload, fileNameUpload, userId, convertAccessToken);
            const convertFileName = `${path.parse(uploadFileStorage).name}${ExtensionFile.PDF}`;
            const options = {
                hostname: 'api.aspose.cloud',
                path: `/v4.0/words/${uploadFileStorage}?format=pdf`,
                timeout: TimeEnum.TIMEOUT_REQUEST,
                method: 'get',
                headers: {
                    'accept': 'application/octet-stream',
                    'Authorization': `Bearer ${convertAccessToken}`
                },
            };
            const promise = new Promise<ConvertFileEntity>((resolve, reject) => {
                const request = https.request(options, (res) => {
                    let data = [];
                    res.on('data', (chunk) => {
                        data.push(chunk);
                    });
                    res.on('end', async () => {
                        const saveFilePath = await this.localStorageService.bufferToFile(data, convertFileName, userId);
                        console.log(`total time convertDocToPdf: ${new Date().getTime() - timer}`);
                        resolve(saveFilePath);
                    });
                });
                request.on('error', (error) => { reject(new BadRequestException(`${error?.message}`)); })
                request.on('timeout', () => { request.destroy(); });
                request.end();
            });
            return promise;
        } catch (error) {
            throw new BadRequestException(error?.message || `convertDocToPdf(ConvertFileService) error`);
        }
    }
}