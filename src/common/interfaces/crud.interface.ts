import type { FilterQuery, ObjectId } from 'mongoose';

export default interface CRUD<T> {
  findAll: (
    filter?: FilterQuery<T>,
    limit?: number,
    page?: number,
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
