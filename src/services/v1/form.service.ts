import { FilterQuery, ObjectId } from 'mongoose';

import CRUD from '@common/interfaces/crud.interface';
import Form, { IForm, IFormSchema } from '@models/form.model';
import FormDto from '@v1/form/dtos/form.dto';
import dayjs from 'dayjs';
import { IUserSchema } from '@models/users.model';

export class FormService implements CRUD<IFormSchema> {
  private readonly formModel = Form;

  async create(data: FormDto): Promise<IFormSchema> {
    return this.formModel.create(data);
  }

  async findAll(findParams: {
    filter?: FilterQuery<IFormSchema>,
    limit?: number,
    page?: number,
    user?: IUserSchema,
  }): Promise<{ docs: IFormSchema[]; meta: { totalDocs: number; totalPages: number; page: number } }> {
    console.log({ filter: findParams.user });

    const mode = findParams?.filter?.mode;

    // Title search
    if (typeof findParams?.filter?.title === 'string') {
      if (findParams.filter.title) {
        findParams.filter.title = { $regex: findParams.filter.title, $options: 'i' };
      } else {
        delete findParams.filter.title;
      }
    }

    // Boolean conversion
    if (findParams?.filter?.isActive && typeof findParams?.filter?.isActive === 'string') {
      findParams.filter.isActive = findParams.filter.isActive === 'true';
    }

    // Date range filter
    if (
      typeof findParams?.filter?.fromDate === 'string' &&
      typeof findParams?.filter?.toDate === 'string'
    ) {
      const fromParts = findParams.filter.fromDate.trim().split('-');
      const toParts = findParams.filter.toDate.trim().split('-');

      if (fromParts.length === 3 && toParts.length === 3) {
        const fromDate = dayjs(`${fromParts[2]}-${fromParts[1]}-${fromParts[0]}`, 'YYYY-MM-DD').startOf('day');
        const toDate = dayjs(`${toParts[2]}-${toParts[1]}-${toParts[0]}`, 'YYYY-MM-DD').endOf('day');

        if (fromDate.isValid() && toDate.isValid()) {
          findParams.filter.createdAt = { $gte: fromDate.toDate(), $lte: toDate.toDate() };
          delete findParams.filter.fromDate;
          delete findParams.filter.toDate;
        }
      }
    }

    // Org restriction
    if (
      (findParams?.filter?.mode && typeof findParams?.filter?.mode === 'string') ||
      (findParams?.filter?.status && typeof findParams?.filter?.status === 'string')
    ) {
      findParams.filter.orgId = findParams.user.orgId;
    }

    // Mode to status conversion
    if (mode && typeof mode === 'string') {
      if (mode === 'sent') {
        findParams.filter.status = 'published';
      }
      delete findParams.filter.mode;
    }

    // Projection setup
    let projection: Record<string, any> = {};
    if (findParams.filter.status === 'draft') {
      projection = { allowedDomains: 0, allowedEmails: 0 }; // hide completely
    } else if (mode === 'sent') {
      projection = {
        allowedDomains: { $slice: 2 },
        allowedEmails: { $slice: 2 },
      }; // only first two elements
    }

    console.log({ filter: findParams.filter, projection });

    const totalDocs = await this.formModel.countDocuments(findParams.filter);
    const docs = await this.formModel
      .find(findParams.filter)
      .limit(findParams.limit)
      .skip(findParams.limit * findParams.page)
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
        totalPages: Math.ceil(totalDocs / findParams.limit) || 0,
        page: findParams.page,
      },
    };
  }

  async getById(id: ObjectId): Promise<IFormSchema | null> {
    return this.formModel.findById(id, {
      allowedDomains: 0,
      allowedEmails: 0,
    });
  }

  async getVisibilityAndEmails(id: ObjectId): Promise<{ visibility: string[]; allowedEmails: string[] } | null> {
    const form = await this.formModel
      .findById(id)
      .select('settings.visibility allowedEmails')
      .lean();
    if (!form) {
      return null;
    }
    return {
      visibility: form.settings?.visibility || [],
      allowedEmails: form.allowedEmails || [],
    };
  }

  async update(id: ObjectId, data: Partial<IForm>): Promise<IFormSchema | null> {
    return this.formModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: ObjectId): Promise<IFormSchema | null> {
    return this.formModel.findByIdAndDelete(id);
  }

  async publish(id: ObjectId): Promise<IFormSchema | null> {
    return this.formModel.findByIdAndUpdate(id, { status: 'published' }, { new: true });
  }
}