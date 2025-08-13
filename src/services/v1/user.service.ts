import bcrypt from 'bcrypt';
import { ObjectId } from 'mongoose';
import { BadRequestError } from 'routing-controllers';

import CRUD from '@common/interfaces/crud.interface';
import { UserRole } from '@common/types/roles';
import Users, { IUser, IUserSchema } from '@models/users.model';
import RegisterDto from '@v1/auth/dtos/register.dto';
import { FilterQuery } from 'mongoose';
import dayjs from 'dayjs';
import { UserOrganizationWithOrgIdDto } from '@v1/organizations/dtos/invite-organization.dto';

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

  async createUserWayInvitation(userData: UserOrganizationWithOrgIdDto[]) {
    const emails = userData.map(user => user.email);

    // Check if any of these emails are already taken
    const existing = await this.userModel.findOne({ email: { $in: emails } });
    if (existing) {
      throw new BadRequestError(`Email already taken: ${existing.email}`);
    }

    // Add default password for each user
    const inviteUsers = userData.map(user => ({
      ...user,
      password: "Test@123"
    }));

    const users = await this.userModel.insertMany(inviteUsers);
    return users;
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
    const { username } = updateBody
    const user = await this.getById(id);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    Object.assign(user, { ...user, username });
    await user.save();
    return user;
  }

  async getAllRoles(): Promise<{ value: string; label: string }[]> {
    return new Promise((resolve) => {
      resolve([
        { value: "super_admin", label: "Admin" },
        { value: "member", label: "Member" }
      ]);
    });
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

  async findAllByOrg(
    findParams: {
      filter?: FilterQuery<IUserSchema>,
      limit?: number,
      page?: number,
      user?: IUserSchema,
    } = {}
  ) {
    const { filter = {}, limit = 10, page = 0, user } = findParams;

    console.log({ findParams });

    // Title (name) search
    if (typeof filter?.name === 'string') {
      if (filter.name) {
        filter.name = { $regex: filter.name, $options: 'i' };
      } else {
        delete filter.name;
      }
    }

    // Email search
    if (typeof filter?.email === 'string') {
      if (filter.email) {
        filter.email = { $regex: filter.email, $options: 'i' };
      } else {
        delete filter.email;
      }
    }

    // Boolean conversion for isActive
    if (filter?.isActive && typeof filter.isActive === 'string') {
      filter.isActive = filter.isActive === 'true';
    }

    // Date range filter
    if (typeof filter?.fromDate === 'string' && typeof filter?.toDate === 'string') {
      const fromParts = filter.fromDate.trim().split('-');
      const toParts = filter.toDate.trim().split('-');

      if (fromParts.length === 3 && toParts.length === 3) {
        const fromDate = dayjs(`${fromParts[2]}-${fromParts[1]}-${fromParts[0]}`, 'YYYY-MM-DD').startOf('day');
        const toDate = dayjs(`${toParts[2]}-${toParts[1]}-${toParts[0]}`, 'YYYY-MM-DD').endOf('day');

        if (fromDate.isValid() && toDate.isValid()) {
          filter.createdAt = { $gte: fromDate.toDate(), $lte: toDate.toDate() };
          delete filter.fromDate;
          delete filter.toDate;
        }
      }
    }

    // Always restrict to current org
    if (user?.orgId) {
      filter.orgId = user.orgId;
    }

    // Projection setup (optional: hide sensitive fields like password)
    const projection: Record<string, any> = { password: 0 };

    console.log({ filter, projection });

    const totalDocs = await this.userModel.countDocuments(filter);
    const docs = await this.userModel
      .find(filter)
      .limit(limit)
      .skip(limit * page)
      .select(projection)
      .sort({ createdAt: -1 })
      .lean();

    const modifiedData = docs.map((doc: any) => ({
      ...doc,
      createdAt: dayjs(doc.createdAt).format('DD-MM-YYYY'),
      updatedAt: dayjs(doc.updatedAt).format('DD-MM-YYYY'),
    }));

    return {
      docs: modifiedData,
      meta: {
        totalDocs,
        totalPages: Math.ceil(totalDocs / limit) || 0,
        page,
      },
    };
  }

  async delete(id: ObjectId): Promise<IUser | null> {
    return this.userModel.findByIdAndDelete(id);
  }
}
