import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import * as fs from 'fs';
import { nanoid } from 'nanoid';
import * as path from 'path';
import { LOCAL_STORAGE_UPLOAD_FILE } from "src/shared/local-storage.const";
import { Role } from "src/shared/role.enum";
@Injectable()
export class FileUploadService {
    constructor() { }
    async writeFileUpload(files: Array<Express.Multer.File>,
        userId = Role.GUEST as string): Promise<{ pathFile: string, fileName: string }[]> {
        try {
            const userFolderPath = path.join(LOCAL_STORAGE_UPLOAD_FILE, userId); // create name user folder
            const mkdir = fs.mkdirSync(userFolderPath, { recursive: true });    // make user folder
            const rs = await Promise.all(files.map((file) => {
                const fileName = `(${nanoid(2)})${file.originalname}`;
                const pathFile = path.join(userFolderPath, fileName);
                fs.writeFile(pathFile, file.buffer, (error) => {
                    if (error) { throw new NotFoundException(`writeFileUpload(FileUploadService) error: ${error?.message}`); }
                });
                return {
                    pathFile: pathFile,
                    fileName: fileName,
                };
            }));
            if (rs.length > 0) {
                return rs;
            }
            throw new BadRequestException(`writeFileUpload(FileUploadService) error: ${files.length} file write failed`);
        } catch (error) {
            throw new NotFoundException(error?.message || `writeFileUpload(FileUploadService) error`);
        }
    }
}