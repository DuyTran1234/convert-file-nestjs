import { BadRequestException, Injectable } from "@nestjs/common";
import * as fs from 'node:fs';
import * as path from 'node:path';
import { LOCAL_STORAGE_CONVERT_FILE } from "src/shared/local-storage.const";

@Injectable()
export class LocalStorageService {
    constructor() { }
    public async createLocalStorageConvertFile(userId: string): Promise<string> {
        try {
            const userLocalStorageConvertFile = path.join(LOCAL_STORAGE_CONVERT_FILE, userId);
            const promise = new Promise<string>((resolve, reject) => {
                const mkdir = fs.mkdir(userLocalStorageConvertFile, { recursive: true }, (error) => {
                    if (error) { reject(new BadRequestException(`${error?.message}`)) }
                    else { resolve(userLocalStorageConvertFile); }
                });
            });
            return promise;
        } catch (error) {
            throw new BadRequestException(error?.message || 'createLocalStorage(ConvertFileService) error');
        }
    }
    public async bufferToFile(data: any[], convertFileName: string, userId: string): Promise<string> {
        try {
            const timer = new Date().getTime();
            const userLocalStorageConvertFile = await this.createLocalStorageConvertFile(userId);
            const saveFilePath = path.join(userLocalStorageConvertFile, convertFileName);
            const processWriteFile = data.forEach((buffer) => {
                const writeFile = fs.writeFileSync(saveFilePath, buffer, {
                    encoding: 'utf8',
                    flag: 'a'
                });
            });
            console.log(`time write file from buffer: ${new Date().getTime() - timer}`);
            return saveFilePath;
        } catch (error) {
            throw new BadRequestException(error?.message || `bufferToFile(ConvertFileService) error`);
        }
    }
    public async deleteFileUpload(pathFile: string): Promise<boolean> {
        try {
            let flag = false;
            const check = fs.unlink(pathFile, (error) => {
                if (error) { throw new BadRequestException(`${error?.message}`); }
                else { flag = true; }
            });
            return flag;
        } catch (error) {
            throw new BadRequestException(error?.message || `deleteFileUpload(ConvertFileService) error`);
        }
    }
}