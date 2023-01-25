import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import * as dotenv from "dotenv";
import { AuthModule } from "./auth/auth.module";
import { ConvertFileModule } from "./convert-file/convert-file.module";
import { FileUploadModule } from "./file-upload/file-upload.module";
import { UserModule } from "./user/user.module";
dotenv.config();

const dbUri = process.env.DATABASE_URI;

@Module({
    imports: [
        MongooseModule.forRoot(dbUri),
        UserModule,
        AuthModule,
        FileUploadModule,
        ConvertFileModule,
    ],
})
export class AppModule { }