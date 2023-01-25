import { Exclude, Expose, Transform } from "class-transformer";
import mongoose from "mongoose";

@Exclude()
export class UserEntity {
    @Transform((params) => params.obj._id)
    @Expose()
    _id: mongoose.Types.ObjectId;

    @Expose()
    username: string;

    @Expose()
    email: string;

    @Expose()
    fullname: string;

    @Expose()
    address: string;

    @Expose()
    avatar: string;

    @Exclude() pwd: string;

    @Exclude() role: string;

}