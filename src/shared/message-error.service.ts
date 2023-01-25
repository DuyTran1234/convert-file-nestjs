import { ValidationError } from "class-validator";

export class MessageError {
    static async getErrorMessage(errors: ValidationError[]): Promise<string> {
        const firstErrConstraints = errors.at(0).constraints;
        for (let key in firstErrConstraints) {
            return firstErrConstraints[key];
        }
    }
}