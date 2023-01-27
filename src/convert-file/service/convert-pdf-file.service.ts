import { BadRequestException, Injectable } from "@nestjs/common";
import * as FormData from "form-data";
import * as fs from 'node:fs';
import * as https from 'node:https';
import * as path from 'node:path';
import { ExtensionFile } from "src/shared/extension-file.enum";
import { Role } from "src/shared/role.enum";
import { TimeEnum } from "src/shared/time.enum";
import { LocalStorageService } from "./local-storage.service";

const TIMEOUT_REQUEST = TimeEnum.TIMEOUT_REQUEST;

@Injectable()
export class ConvertPdfFileService {
    constructor(
        private localStorageService: LocalStorageService,
    ) { }
    public async uploadFilePdfToStorage(pathFileUpload: string, fileNameUpload: string,
        userId: string, convertAccessToken: string): Promise<string> {
        try {
            const timer = new Date().getTime();
            const promise = new Promise<string>((resolve, reject) => {
                const formData = new FormData();
                formData.append('file', fs.createReadStream(pathFileUpload));
                const options = {
                    timeout: TIMEOUT_REQUEST,
                    hostname: 'api.aspose.cloud',
                    method: 'put',
                    path: `/v3.0/pdf/storage/file/${fileNameUpload}`,
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                        'authorization': `Bearer ${convertAccessToken}`,
                        ...formData.getHeaders(),
                    },
                };
                const request = https.request(options, async (res) => {
                    if (res.statusCode === 200 || res.statusCode === 201) {
                        if (userId.localeCompare(Role.GUEST) === 0) {
                            const deleteFile = await this.localStorageService.deleteFileUpload(pathFileUpload);
                        }
                        console.log(`total time uploadFilePdfToStorage: ${new Date().getTime() - timer}`);
                        resolve(fileNameUpload);
                    }
                    else { reject(new BadRequestException(`uploadFilePdfToStorage(ConvertPdfFileService) error`)); }
                });
                request.on('error', (error) => {
                    reject(new BadRequestException(`${error?.message}`));
                });
                request.on('timeout', () => { request.destroy() });
                formData.pipe(request, { end: true });
            });
            return promise;
        } catch (error) {
            throw new BadRequestException(error?.message || `uploadFilePdfToStorage(ConvertPdfFileService) error`)
        }
    }
    public async convertPdfToDoc(pathFileUpload: string, fileNameUpload: string,
        userId: string, convertAccessToken: string): Promise<string> {
        try {
            const timer = new Date().getTime();
            const uploadFile = await this.uploadFilePdfToStorage(pathFileUpload, fileNameUpload, userId, convertAccessToken);
            const convertFileName = `${path.parse(fileNameUpload).name}${ExtensionFile.DOC}`;
            const options = {
                timeout: TIMEOUT_REQUEST,
                hostname: 'api.aspose.cloud',
                path: `/v3.0/pdf/${uploadFile}/convert/doc`,
                method: 'get',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${convertAccessToken}`,
                },
            };
            const promise = new Promise<string>((resolve, reject) => {
                const request = https.request(options, (res) => {
                    let data = [];
                    res.on('data', (chunk) => {
                        data.push(chunk);
                    });
                    res.on('end', async () => {
                        if (res.statusCode === 200 || res.statusCode === 201) {
                            const saveFilePath = await this.localStorageService.bufferToFile(data, convertFileName, userId);
                            console.log(`total time convertPdfToDoc: ${new Date().getTime() - timer}`);
                            resolve(saveFilePath);
                        }
                        else { reject(new BadRequestException(`convertPdfToDoc(ConvertPdfFileService) error`)); }
                    });
                });
                request.on('error', (error) => {
                    reject(new BadRequestException(`${error?.message}`));
                });
                request.on('timeout', () => { request.destroy(); })
                request.end();
            });
            return promise;
        } catch (error) {
            const msg = error?.message || `convertPdfToDoc(ConvertPdfFileService) error`;
            throw new BadRequestException(msg);
        }
    }
    public async convertPdfToExcel(pathFileUpload: string, fileNameUpload: string,
        userId: string, convertAccessToken: string): Promise<string> {
        try {
            const uploadFile = await this.uploadFilePdfToStorage(pathFileUpload, fileNameUpload, userId, convertAccessToken);
            const timer = new Date().getTime();
            const convertFileName = `${path.parse(fileNameUpload).name}${ExtensionFile.XLSX}`;
            const options = {
                hostname: 'api.aspose.cloud',
                path: `/v3.0/pdf/${fileNameUpload}/convert/xlsx`,
                method: 'get',
                timeout: TIMEOUT_REQUEST,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${convertAccessToken}`,
                },
            };
            const promise = new Promise<string>((resolve, reject) => {
                const request = https.request(options, (res) => {
                    let data = [];
                    res.on('data', (chunk) => { data.push(chunk); });
                    res.on('end', async () => {
                        if (res.statusCode === 200 || res.statusCode === 201) {
                            const saveFilePath = await this.localStorageService.bufferToFile(data, convertFileName, userId);
                            console.log(`total time convertPdfToExcel: ${new Date().getTime() - timer}`);
                            resolve(saveFilePath);
                        }
                        else { reject(new BadRequestException(`convertPdfToExcel(ConvertPdfFileService) error`)); }
                    });
                });
                request.on('error', (error) => {
                    reject(new BadRequestException(`${error?.message}`));
                });
                request.on('timeout', () => { request.destroy(); });
                request.end();
            });
            return promise;
        } catch (error) {
            throw new BadRequestException(error?.message || `convertPdfToExcel(ConvertPdfFileService) error`);
        }
    }
    public async convertPdfToPptx(pathFileUpload: string, fileNameUpload: string,
        userId: string, convertAccessToken: string): Promise<string> {
        try {
            const uploadFileStorage = await this.uploadFilePdfToStorage(pathFileUpload, fileNameUpload, userId, convertAccessToken);
            const timer = new Date().getTime();
            const convertFileName = `${path.parse(fileNameUpload).name}${ExtensionFile.PPTX}`;
            const options = {
                hostname: 'api.aspose.cloud',
                path: `/v3.0/pdf/${uploadFileStorage}/convert/pptx`,
                method: 'get',
                timeout: TIMEOUT_REQUEST,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${convertAccessToken}`,
                },
            };
            const promise = new Promise<string>((resolve, reject) => {
                const request = https.request(options, (res) => {
                    let data = [];
                    res.on('data', (chunk) => { data.push(chunk); });
                    res.on('end', async () => {
                        const saveFilePath = await this.localStorageService.bufferToFile(data, convertFileName, userId);
                        if (res.statusCode === 200 || res.statusCode === 201) {
                            console.log(`total time convertPdfToPptx: ${new Date().getTime() - timer}`);
                            resolve(saveFilePath);
                        }
                        else { reject(new BadRequestException(`convertPdfToPptx(ConvertPdfFileService) error`)); }
                    });
                });
                request.on('error', (error) => { reject(new BadRequestException(`${error?.message}`)); });
                request.on('timeout', () => { request.destroy(); });
                request.end();
            });
            return promise;
        } catch (error) {
            throw new BadRequestException(error?.message || `convertPdfToDoc(ConvertPdfFileService) error`);
        }
    }
    public async convertPdfToEpub(pathFileUpload: string, fileNameUpload: string,
        userId: string, convertAccessToken: string): Promise<string> {
        try {
            const uploadFileStorage = await this.uploadFilePdfToStorage(pathFileUpload, fileNameUpload, userId, convertAccessToken);
            const timer = new Date().getTime();
            const convertFileName = `${path.parse(fileNameUpload).name}${ExtensionFile.EPUB}`;
            const options = {
                hostname: 'api.aspose.cloud',
                path: `/v3.0/pdf/${uploadFileStorage}/convert/epub`,
                method: 'get',
                timeout: TIMEOUT_REQUEST,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${convertAccessToken}`,
                },
            };
            const promise = new Promise<string>((resolve, reject) => {
                const request = https.request(options, (res) => {
                    let data = [];
                    res.on('data', (chunk) => { data.push(chunk); });
                    res.on('end', async () => {
                        const saveFilePath = await this.localStorageService.bufferToFile(data, convertFileName, userId);
                        if (res.statusCode === 200 || res.statusCode === 201) {
                            console.log(`total time convertPdfToEpub: ${new Date().getTime() - timer}`);
                            resolve(saveFilePath);
                        }
                        else { reject(new BadRequestException(`convertPdfToEpub(ConvertPdfFileService) error`)); }
                    });
                });
                request.on('error', (error) => { reject(new BadRequestException(`${error?.message}`)); });
                request.on('timeout', () => { request.destroy(); });
                request.end();
            });
            return promise;
        } catch (error) {
            throw new BadRequestException(error?.message || `convertPdfToEpub(ConvertPdfFileService) error`);
        }
    }
}