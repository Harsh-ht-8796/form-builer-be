// Form Service

import { FilterQuery, ObjectId } from 'mongoose';

import CRUD from '@common/interfaces/crud.interface';
import Form, { IForm, IFormSchema } from '@models/form.model';
import FormDto from '@v1/form/dtos/form.dto';
import dayjs from 'dayjs';

export class FormService implements CRUD<IFormSchema> {
  private readonly formModel = Form;

  async create(data: FormDto): Promise<IFormSchema> {
    return this.formModel.create(data);
  }

  async findAll(filter: FilterQuery<IFormSchema> = {},
    limit = 10, page = 0): Promise<{ docs: IFormSchema[]; meta: { totalDocs: number; totalPages: number; page: number } }> {


    if (typeof filter?.title === 'string') {
      if (filter?.title) {
        filter.title = { $regex: filter.title, $options: 'i' };
      } else {
        delete filter.title
      }
    }

    if (filter?.isActive && typeof filter?.isActive === 'string') {
      filter.isActive = filter.isActive === 'true' ? true : false;
    }
    if (filter?.fromDate && typeof filter?.fromDate === 'string' && filter?.toDate && typeof filter?.toDate === 'string') {

      const fromParts = filter.fromDate.trim().split('-'); // ['31', '07', '2025']
      const toParts = filter.toDate.trim().split('-');

      if (fromParts.length === 3 && toParts.length === 3) {
        const fromDate = dayjs(`${fromParts[2]}-${fromParts[1]}-${fromParts[0]}`, 'YYYY-MM-DD').startOf('day');
        const toDate = dayjs(`${toParts[2]}-${toParts[1]}-${toParts[0]}`, 'YYYY-MM-DD').endOf('day');

        if (fromDate.isValid() && toDate.isValid()) {
          filter.createdAt = { $gte: new Date(fromDate.toDate()), $lte: new Date(toDate.toDate()) };
          delete filter.fromDate;
          delete filter.toDate;
        }
      }
    }

    const totalDocs = await this.formModel.countDocuments(filter);
    const docs = await this.formModel
      .find(filter)
      .limit(limit)
      .skip(limit * page)
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
        totalPages: Math.ceil(totalDocs / limit) || 0,
        page,
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
