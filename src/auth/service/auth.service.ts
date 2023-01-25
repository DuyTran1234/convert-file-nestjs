import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { HashPassword } from "src/shared/hash-password.service";
import { UserService } from "src/user/service/user.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private jwtService: JwtService,
    ) { }
    async validateUser(username: string, password: string) {
        try {
            const user = await this.userService.findUser({ username: username });
            if (user) {
                const checkPassword = await HashPassword.compare(password, user.pwd);
                if (checkPassword) {
                    const { pwd, ...rest } = user;
                    return rest;
                }
            }
            throw new UnauthorizedException(`validateUser(AuthService) error: validate user failed`)
        } catch (error) {
            throw new BadRequestException(error?.message || `validateUser AuthService error`);
        }
    }
    async getAccessToken(user: any) {
        try {
            if (!user) {
                throw new UnauthorizedException(`getAccessToken(AuthService) error: validate user failed`);
            }
            const payload = { _id: user._id, username: user.username };
            return { access_token: this.jwtService.sign(payload) };
        } catch (error) {
            throw new BadRequestException(error?.message || `getAccessToken AuthService error`);
        }
    }
}