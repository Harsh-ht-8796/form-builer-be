// Form Service

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
    console.log({ filter: findParams.user })


    if (typeof findParams?.filter?.title === 'string') {
      if (findParams?.filter?.title) {
        findParams.filter.title = { $regex: findParams.filter.title, $options: 'i' };
      } else {
        delete findParams.filter.title
      }
    }

    if (findParams?.filter?.isActive && typeof findParams?.filter?.isActive === 'string') {
      findParams.filter.isActive = findParams.filter.isActive === 'true' ? true : false;
    }
    if (findParams?.filter?.fromDate && typeof findParams?.filter?.fromDate === 'string' && findParams?.filter?.toDate && typeof findParams?.filter?.toDate === 'string') {

      const fromParts = findParams.filter.fromDate.trim().split('-'); // ['31', '07', '2025']
      const toParts = findParams.filter.toDate.trim().split('-');

      if (fromParts.length === 3 && toParts.length === 3) {
        const fromDate = dayjs(`${fromParts[2]}-${fromParts[1]}-${fromParts[0]}`, 'YYYY-MM-DD').startOf('day');
        const toDate = dayjs(`${toParts[2]}-${toParts[1]}-${toParts[0]}`, 'YYYY-MM-DD').endOf('day');

        if (fromDate.isValid() && toDate.isValid()) {
          findParams.filter.createdAt = { $gte: new Date(fromDate.toDate()), $lte: new Date(toDate.toDate()) };
          delete findParams.filter.fromDate;
          delete findParams.filter.toDate;
        }
      }
    }

    if ((findParams?.filter?.mode && typeof findParams?.filter?.mode === 'string') || (findParams?.filter?.status && typeof findParams?.filter?.status === 'string')) {
      findParams.filter.orgId = findParams.user.orgId
    }

    if (findParams?.filter?.mode && typeof findParams?.filter?.mode === 'string') {
      if (findParams.filter.mode === 'sent') {
        findParams.filter.status = 'published'
      }
      delete findParams.filter.mode;
    }

    console.log({ filter: findParams.filter })

    const totalDocs = await this.formModel.countDocuments(findParams.filter);
    const docs = await this.formModel
      .find(findParams.filter)
      .limit(findParams.limit)
      .skip(findParams.limit * findParams.page)
      .select({ allowedDomains: 0, allowedEmails: 0 }) // Exclude sensitive fields
      .sort({ createdAt: -1 })
      .lean();
    const modifedData = JSON.parse(JSON.stringify(docs)).map((doc: any) => {
      return {
        ...doc,
        createdAt: dayjs(doc.createdAt).format('DD-MM-YYYY').toString(),
        updatedAt: dayjs(doc.createdAt).format('DD-MM-YYYY').toString(),
      };
    })
    return {
      docs: modifedData,
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
      alowedEmails: 0,
    });
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
