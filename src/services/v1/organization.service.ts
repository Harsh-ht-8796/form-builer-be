// IOrganization
import { FilterQuery, ObjectId, UpdateWriteOpResult } from 'mongoose';

import CRUD from '@common/interfaces/crud.interface';
import Organization, { IOrganization, IOrganizationSchema } from '@models/organization.model';
import Users from '@models/users.model';
import { OrganizationDto } from '@v1/organizations/dtos/organization.dto';
import { TokenService } from './token.service';
import { UserService } from './user.service';
import { UserOrganizationWithOrgIdDto } from '@v1/organizations/dtos/invite-organization.dto';

export class OrganizationService implements CRUD<IOrganizationSchema> {
  private readonly organizationModel = Organization;
  private readonly userModel = Users;
  private readonly userService = new UserService();

  async create(data: OrganizationDto): Promise<IOrganizationSchema> {
    return this.organizationModel.create(data);
  }


  async mapToUser(data: OrganizationDto): Promise<UpdateWriteOpResult> {
    const org = await this.organizationModel.create(data);

    const updatedUser = this.userModel.updateOne(
      { _id: data.createdBy },
      { $set: { orgId: org._id, isInitialPasswordUpdated: true } }
    ).exec();
    return updatedUser;
  }

  async userInvitation(data: UserOrganizationWithOrgIdDto[]) {
    return this.userService.createUserWayInvitation(data);
  }

  async findAll(filter: FilterQuery<IOrganizationSchema> = {}, limit = 10, page = 0): Promise<{ docs: IOrganizationSchema[]; meta: { totalDocs: number; totalPages: number; page: number } }> {
    const totalDocs = await this.organizationModel.countDocuments(filter);
    const docs = await this.organizationModel
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

  async getById(id: ObjectId): Promise<IOrganizationSchema | null> {
    return this.organizationModel.findById(id);
  }

  async update(id: ObjectId, data: Partial<IOrganization>): Promise<IOrganizationSchema | null> {

    return this.organizationModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: ObjectId): Promise<IOrganizationSchema | null> {
    return this.organizationModel.findByIdAndDelete(id);
  }
}
