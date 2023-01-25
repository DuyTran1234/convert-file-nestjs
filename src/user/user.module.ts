import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { CaslModule } from "src/casl/casl.module";
import { UserController } from "./controller/user.controller";
import { User, UserSchema } from "./schema/user.schema";
import { UserService } from "./service/user.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
        ]),
        forwardRef(() => AuthModule),
        forwardRef(() => CaslModule),
    ],
    providers: [
        UserService,
    ],
    controllers: [
        UserController,
    ],
    exports: [
        UserService,
    ],
})
export class UserModule { }
