import { AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { Action } from "src/shared/action.enum";
import { Role } from "src/shared/role.enum";
import { User } from "src/user/schema/user.schema";

type Subjects = InferSubjects<typeof User> | 'all';

export type UserAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class UserAbilityFactory {
    createForUser(user: User) {
        const { can, build } = new AbilityBuilder<UserAbility>(createMongoAbility);
        if (user.role === Role.ADMIN) {
            can(Action.MANAGE, 'all');
        }
        else if (user.role === Role.USER) {
            can(Action.MANAGE, User, { _id: user._id });
        }

        return build({
            detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}