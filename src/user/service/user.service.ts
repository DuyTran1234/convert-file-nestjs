import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { HashPassword } from "src/shared/hash-password.service";
import { Role } from "src/shared/role.enum";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { User, UserDocument } from "../schema/user.schema";

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        try {
            const checkUser = await this.findUser({ username: createUserDto.username, email: createUserDto.email });
            if (!checkUser) {
                createUserDto.role = Role.USER;
                createUserDto.pwd = await HashPassword.hashPassword(createUserDto.pwd);
                const create = await this.userModel.create(createUserDto);
                return create.toObject();
            }
            throw new BadRequestException(`user registered`);
        } catch (error) {
            throw new BadRequestException(error?.message || `createUser(UserService) error`);
        }
    }
    async findUser({ username = null, email = null }: any): Promise<User> {
        try {
            const findUserQuery = {
                $or: [
                    {
                        username: {
                            $ne: null,
                            $eq: username,
                        }
                    },
                    {
                        email: {
                            $ne: null,
                            $eq: email,
                        },
                    },
                ],
            }
            const findUser = await this.userModel.findOne(findUserQuery).lean();
            if (!findUser) { return null; }
            return findUser;
        } catch (error) {
            throw new BadRequestException(error?.message || `findUser(UserService) error`);
        }
    }
    async findUserById(userId: string): Promise<User> {
        try {
            const findUser = await this.userModel.findById(userId).lean();
            if (!findUser) { return null; }
            return findUser;
        } catch (error) {
            throw new BadRequestException(error?.message || `findUserById(UserService) error`);
        }
    }

    async updateUser(updateUserDto: UpdateUserDto): Promise<User> {
        try {
            if (updateUserDto.pwd) {
                updateUserDto.pwd = await HashPassword.hashPassword(updateUserDto.pwd);
            }
            const updateUser =
                await this.userModel.findOneAndUpdate({ _id: updateUserDto._id }, updateUserDto, { new: true }).lean();
            if (!updateUser) { throw new BadRequestException(`updateUser(UserService) error`); }
            return updateUser;
        } catch (error) {
            throw new BadRequestException(error?.message || `updateUser(UserService) error`);
        }
    }

    async deleteUserById(userId: string): Promise<string> {
        try {
            const deleteUser = await this.userModel.findOneAndDelete({ _id: userId }).lean();
            if (!deleteUser) {
                throw new BadRequestException({ message: `delete user ${userId} failed`, code: 6 })
            }
            return `delete user ${userId} succes`;
        } catch (error) {
            if (error) { throw error }
            throw new BadRequestException(`deleteUserById service error`);
        }
    }
}