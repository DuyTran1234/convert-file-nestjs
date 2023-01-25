import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { UserRegex } from "../regex/user-regex";

export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true })
export class User {
    _id: mongoose.Types.ObjectId;

    @Prop({
        required: true,
        unique: true,
        validate: UserRegex.username,
    })
    username: string;

    @Prop({
        required: true,
    })
    pwd: string;

    @Prop({
        unique: true,
        validate: UserRegex.email,
        sparse: true,
    })
    email: string;

    @Prop({
        required: true,
        validate: UserRegex.role,
    })
    role: string;

    @Prop({
        required: true,
        validate: UserRegex.fullname,
    })
    fullname: string;

    @Prop({
        validate: UserRegex.address,
    })
    address: string;

    @Prop()
    keyProduct: string;

    @Prop()
    avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);