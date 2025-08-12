import { IUserSchema } from '@models/users.model';
import type { FilterQuery, ObjectId } from 'mongoose';

export default interface CRUD<T> {
  findAll: (
    findParams: {
      filter?: FilterQuery<T>,
      limit?: number,
      page?: number,
      user?: IUserSchema,
    }
  ) => Promise<{
    docs: Array<T>;
    meta: {
      totalDocs: number;
      totalPages: number;
      page: number;
    };
  }>;
  getById: (id: ObjectId) => Promise<T | null>;
}
