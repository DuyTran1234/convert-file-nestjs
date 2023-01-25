import * as bcrypt from "bcrypt";

export class HashPassword {
    static async hashPassword(pwd: string): Promise<string> {
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(pwd, saltOrRounds);
        return hash;
    }

    static async compare(pwd: string, hash: string): Promise<boolean> {
        const comparePwd = await bcrypt.compare(pwd, hash);
        return comparePwd;
    }
}