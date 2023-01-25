import { Injectable, UnauthorizedException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { Action } from "src/shared/action.enum";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
import { User } from "src/user/schema/user.schema";
import { UserService } from "src/user/service/user.service";
import { UserAbilityFactory } from "../factory/user-ability.factory";

@Injectable()
export class UserAbilityService {
    constructor(
        private readonly userAbilityFactory: UserAbilityFactory,
        private readonly userService: UserService,
    ) { }
    async updateUser(reqUserId: string, updateUserDto: UpdateUserDto): Promise<boolean> {
        try {
            const reqUser = await this.userService.findUserById(reqUserId);
            if (reqUser) {
                const ability = this.userAbilityFactory.createForUser(reqUser);
                const userUpdate = plainToInstance(User, updateUserDto);
                if (ability.can(Action.UPDATE, userUpdate)) { return true; }
            }
            throw new UnauthorizedException(`updateUser(UserAbilityService) error: reqUser undefined`);
        } catch (error) {
            throw new UnauthorizedException(error.message || `updateUser(UserAbilityService) error`);
        }
    }
    async getUser(reqUserId: string, findUserId: string): Promise<boolean> {
        try {
            const reqUser = await this.userService.findUserById(reqUserId);
            if (reqUser) {
                if (reqUser._id.toString().localeCompare(findUserId) === 0) { return true; }
            }
            throw new UnauthorizedException(`getUser(UserAbilityService) error: reqUser undefined`);
        } catch (error) {
            throw new UnauthorizedException(error.message || `getUser(UserAbilityService) error`);
        }
    }
    async deleteUser(reqUserId: string, deleteUserId: string): Promise<boolean> {
        try {
            const reqUser = await this.userService.findUserById(reqUserId);
            if (reqUser) {
                if (reqUser._id.toString().localeCompare(deleteUserId) === 0) { return true; }
            }
            throw new UnauthorizedException(`deleteUser(UserAbilityService) error: reqUser undefined`);
        } catch (error) {
            throw new UnauthorizedException(error.message || `deleteUser(UserAbilityService) error`);
        }
    }
}