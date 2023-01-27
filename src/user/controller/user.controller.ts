import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Req, Request, UnauthorizedException, UseGuards, UsePipes } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { LocalAuthGuard } from "src/auth/guard/local-auth.guard";
import { AuthService } from "src/auth/service/auth.service";
import { UserAbilityService } from "src/casl/service/user-ability.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UserEntity } from "../entity/user.entity";
import { UserService } from "../service/user.service";
import { CreateUserValidator } from "../validator/create-user.validator";
import { UpdateUserValidator } from "../validator/update-user.validator";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly userAbilityService: UserAbilityService,
    ) { }
    @UseGuards(LocalAuthGuard)
    @Post('auth/user-login')
    async loginUser(@Request() req: any) {
        try {
            return this.authService.getAccessToken(req.user);
        } catch (error) {
            throw new UnauthorizedException(error?.message || `loginUser(UserController) error`);
        }
    }

    @UsePipes(CreateUserValidator)
    @Post('create-user')
    async createUser(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
        try {
            const user = await this.userService.createUser(createUserDto);
            const obj = plainToInstance(UserEntity, user);
            return obj;
        } catch (error) {
            throw new BadRequestException(error?.message || `createUser(UserController) error`);
        }
    }

    @UsePipes(UpdateUserValidator)
    @UseGuards(JwtAuthGuard)
    @Post('update-user')
    async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: any): Promise<UserEntity> {
        try {
            const checkAbility = await this.userAbilityService.updateUser(req.user?._id, updateUserDto);
            if (checkAbility) {
                const user = await this.userService.updateUser(updateUserDto);
                const rs = plainToInstance(UserEntity, user);
                return rs;
            }
        } catch (error) {
            throw new BadRequestException(error?.message || `updateUser(UserController) error`);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('get-user/:userId')
    async getUser(@Param('userId') userId: string, @Request() req: any): Promise<UserEntity> {
        try {
            const checkAbility = await this.userAbilityService.getUser(req.user?._id, userId);
            if (checkAbility) {
                const user = await this.userService.findUserById(userId);
                const rs = plainToInstance(UserEntity, user);
                return rs;
            }
        } catch (error) {
            throw new BadRequestException(error?.message || `getUser(UserController) error`);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete-user/:userId')
    async deleteUser(@Param('userId') userId: string, @Req() req: any): Promise<string> {
        try {
            const checkAbility = await this.userAbilityService.deleteUser(req.user?._id, userId);
            if (checkAbility) {
                const rs = await this.userService.deleteUserById(userId);
                return rs;
            }
        } catch (error) {
            throw new BadRequestException(error?.message || `deleteUser(UserController) error`);
        }
    }
}