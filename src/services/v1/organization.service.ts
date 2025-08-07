// IOrganization
import { FilterQuery, ObjectId } from 'mongoose';

import CRUD from '@common/interfaces/crud.interface';
import Organization, { IOrganization, IOrganizationSchema } from '@models/organization.model';
import { OrganizationDto } from '@v1/organizations/dtos/organization.dto';

export class OrganizationService implements CRUD<IOrganizationSchema> {
  private readonly organizationModel = Organization;

  async create(data: OrganizationDto): Promise<IOrganizationSchema> {
    return this.organizationModel.create(data);
  }

  async findAll(filter: FilterQuery<IOrganizationSchema> = {},limit = 10, page = 0): Promise<{ docs: IOrganizationSchema[]; meta: { totalDocs: number; totalPages: number; page: number } }> {
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
