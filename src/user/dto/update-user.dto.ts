import { IsDefined, Matches } from "class-validator";
import { UserRegex } from "../regex/user-regex";

export class UpdateUserDto {
    @IsDefined()
    _id: string;

    @Matches(UserRegex.username)
    username: string;

    @Matches(UserRegex.password)
    pwd: string;

    @Matches(UserRegex.email)
    email: string;

    @Matches(UserRegex.fullname)
    fullname: string;

    @Matches(UserRegex.address)
    address: string;

    avatar: string;
}