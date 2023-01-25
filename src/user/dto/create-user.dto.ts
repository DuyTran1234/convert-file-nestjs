import { IsDefined, Matches } from "class-validator";
import { UserRegex } from "../regex/user-regex";

export class CreateUserDto {
    @IsDefined()
    @Matches(UserRegex.username)
    username: string;

    @IsDefined()
    @Matches(UserRegex.password)
    pwd: string;

    @Matches(UserRegex.email)
    email: string;

    @IsDefined()
    @Matches(UserRegex.fullname)
    fullname: string;

    @Matches(UserRegex.address)
    address: string;

    @Matches(UserRegex.role)
    role: string;
}