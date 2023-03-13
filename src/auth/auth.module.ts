import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import * as dotenv from 'dotenv';
import { UserModule } from "src/user/user.module";
import { AuthService } from "./service/auth.service";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { LocalStrategy } from "./strategy/local.strategy";
dotenv.config();

@Module({
    imports: [
        forwardRef(() => UserModule),
        PassportModule,
        JwtModule.register({
            secret: process.env.SECRET_KEY,
            signOptions: {
                expiresIn: "30d", // 30 days
            }
        }),
    ],
    providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
    ],
    exports: [
        AuthService,
    ],
})
export class AuthModule {

}