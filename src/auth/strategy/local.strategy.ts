import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../service/auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super();
    }
    async validate(username: string, password: string) {
        try {
            const user = await this.authService.validateUser(username, password);
            if (!user) {
                throw new UnauthorizedException(`validate(LocalStrategy) error`);
            }
            return user;
        } catch (error) {
            throw new BadRequestException(error?.message || `validate(LocalStrategy) error`);
        }
    }
}