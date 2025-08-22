import { FilterQuery, ObjectId } from 'mongoose';

import CRUD from '@common/interfaces/crud.interface';
import Form, { IForm, IFormSchema } from '@models/form.model';
import FormDto, { DeleteImage } from '@v1/form/dtos/form.dto';
import dayjs from 'dayjs';
import { IUserSchema } from '@models/users.model';
import { MODELS } from '@common/constants';

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
    if (findParams.filter?.status === 'draft') {
      projection = { allowedDomains: 0, allowedEmails: 0 }; // hide completely
    } else if (mode === 'sent') {
      projection = {
        allowedDomains: { $slice: 2 },
        allowedEmails: { $slice: 2 },
      }; // only first two elements
    }


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

  async getById(id: ObjectId,): Promise<IFormSchema | null> {
    return this.formModel.findOne({ _id: id, isActive: true }, {
      allowedDomains: 0,
      allowedEmails: 0,
    });
  }

  async getByIdFilter(id: ObjectId, filter: FilterQuery<IFormSchema>,): Promise<IFormSchema | null> {
    console.log({ _id: id, ...filter })
    return this.formModel.findOne({ _id: id, ...filter }, {
      allowedDomains: 0,
      allowedEmails: 0,
    });
  }

  async getByIdForStatus(id: ObjectId): Promise<IFormSchema | null> {
    return this.formModel.findOne({ _id: id }, {
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


  async findAllReceivedForm(findParams: {
    filter?: FilterQuery<IFormSchema>,
    limit?: number,
    page?: number,
    user?: IUserSchema,
  }): Promise<{ docs: IFormSchema[]; meta: { totalDocs: number; totalPages: number; page: number } }> {


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
    const visibilityQuery = {
      $or: [
        {
          'settings.visibility': { $in: ['domain_restricted'] },
          orgId: findParams.user.orgId
        },
        {
          'settings.visibility': { $in: ['public'] },
          status: 'published',
        },
        {
          'settings.visibility': { $in: ['private'] },
          status: 'published',
          allowedEmails: { $in: [findParams.user.email] },
        },
      ],
    };
    findParams.filter = { ...findParams.filter, ...visibilityQuery };

    // Projection setup 
    let projection: Record<string, any> = {};

    projection = {
      allowedDomains: { $slice: 2 },
      allowedEmails: { $slice: 2 },
      title: 1,
      createdBy: 1,
      status: 1,
      createdAt: 1,
      isActive: 1
    }; // only first two elements


    const totalDocs = await this.formModel.countDocuments(findParams.filter);
    const docs = await this.formModel
      .find(findParams.filter)
      .limit(findParams.limit)
      .skip(findParams.limit * findParams.page)
      .select(projection)
      .sort({ createdAt: -1 })
      .populate({
        path: "createdBy",
        select: "username email orgId",
        populate: {
          path: "orgId",
          select: "name",
          model: MODELS.ORGANIZATIONS,

        },
      })
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

  async getFormStatusById(id: ObjectId): Promise<IFormSchema | null> {
    return this.formModel.findById(id, {
      isActive: 1,
      fields: 1
    });
  }
  async deleteCoverOrLogo(id: ObjectId, selectImage: DeleteImage) {
    const { image } = selectImage;
    const key = image === "cover" ? "coverImage" : "logoImage";
    return this.formModel.findByIdAndUpdate(id, {
      [key]: ''
    }, {
      new: true
    })
  }
}