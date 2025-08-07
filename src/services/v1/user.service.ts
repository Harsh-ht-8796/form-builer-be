import bcrypt from 'bcrypt';
import { ObjectId } from 'mongoose';
import { BadRequestError } from 'routing-controllers';

import CRUD from '@common/interfaces/crud.interface';
import { UserRole } from '@common/types/roles';
import Users, { IUser, IUserSchema } from '@models/users.model';
import RegisterDto from '@v1/auth/dtos/register.dto';
import { FilterQuery } from 'mongoose';

export class UserService implements CRUD<IUserSchema> {
  private readonly userModel = Users;

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email });

    return !!user;
  }

  async findByRoles(roles: UserRole[]) {
    return await this.userModel.find({ roles: { $in: roles } });
  }

  async createUser(userData: RegisterDto) {
    const { email } = userData;
    if (await this.isEmailTaken(email)) {
      throw new BadRequestError('Email already Taken');
    }
    const user = await this.userModel.create({ ...userData });
    return user;
  }

  async getUserByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async comparePassword(inputPass: string, userPass: string) {
    return await bcrypt.compare(inputPass, userPass);
  }

  async getById(id: ObjectId): Promise<IUserSchema | null> {
    return await this.userModel.findById(id);
  }

  async updateById(id: ObjectId, updateBody: Partial<IUser>): Promise<IUserSchema | null> {
    // prevent user change his email
    if (updateBody.email) {
      delete updateBody.email;
    }

    const user = await this.getById(id);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    Object.assign(user, updateBody);
    await user.save();
    return user;
  }

  async findAll(filter: FilterQuery<IUserSchema> = {}, limit = 10, page = 0) {
    const totalDocs = await this.userModel.countDocuments(filter);
    const docs = await this.userModel
      .find(filter)
      .limit(limit)
      .skip(limit * page)
      .sort({ createdAt: -1 })
      .lean();

    return {
      docs: JSON.parse(JSON.stringify(docs)),
      meta: {
        totalDocs,
        totalPages: Math.ceil(totalDocs / limit) || 0,
        page,
      },
    };
  }
}
