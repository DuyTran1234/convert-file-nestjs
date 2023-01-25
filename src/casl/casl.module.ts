import { forwardRef, Module } from "@nestjs/common";
import { UserModule } from "src/user/user.module";
import { UserAbilityFactory } from "./factory/user-ability.factory";
import { UserAbilityService } from "./service/user-ability.service";

@Module({
    providers: [
        UserAbilityFactory,
        UserAbilityService,
    ],
    imports: [
        forwardRef(() => UserModule),
    ],
    exports: [
        UserAbilityService,
    ],
})
export class CaslModule { }