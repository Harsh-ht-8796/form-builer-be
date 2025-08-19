import { FilterQuery, ObjectId, Types } from 'mongoose';

import CRUD from '@common/interfaces/crud.interface';
import Submission, { IGetSubmissionSummary, ISubmissionSchema } from '@models/submission.model';
import { SubmissionDto, SubmissionSummaryQueryDto } from '@v1/submissions/dto/sumission.dto';
import { IUserSchema } from '@models/users.model';
import moment from 'moment';

export class SubmissionService implements CRUD<ISubmissionSchema> {
  private readonly submissionModel = Submission;

  async create(data: SubmissionDto): Promise<ISubmissionSchema> {
    return this.submissionModel.create(data);
  }

  async findAll(
    filter: FilterQuery<ISubmissionSchema> = {},
    limit = 10,
    page = 0
  ): Promise<{ docs: ISubmissionSchema[]; meta: { totalDocs: number; totalPages: number; page: number } }> {
    const totalDocs = await this.submissionModel.countDocuments(filter);
    const docs = await this.submissionModel
      .find(filter)
      .limit(limit)
      .skip(limit * page)
      .sort({ submittedAt: -1 })
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

  async findSubmissionsByFormId(
    formId: ObjectId,
    { limit = 10, page = 0 }: { limit?: number; page?: number; }
  ): Promise<{ submissions: ISubmissionSchema[] }> {
    const query = { formId, };
    const submissions = await this.submissionModel
      .find(query)
      .limit(Math.min(limit, 100))
      .skip(limit * page)
      .lean();
    return { submissions };
  }

  async getById(id: ObjectId): Promise<ISubmissionSchema | null> {
    return this.submissionModel.findById(id);
  }

  async update(id: ObjectId, data: Partial<ISubmissionSchema>): Promise<ISubmissionSchema | null> {
    return this.submissionModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: ObjectId): Promise<ISubmissionSchema | null> {
    return this.submissionModel.findByIdAndDelete(id);
  }

  async getSubmissionSummary(
    userDetails: IUserSchema,
    query: SubmissionSummaryQueryDto
  ) {
    const { accessibility, fromDate, title, toDate } = query;

    const pipeline: any[] = [
      ...(accessibility ? [{
        $match: {
          accessibility, submittedAt: {
            "$lte": moment(toDate, "DD-MM-YYYY").toDate(),
            "$gte": moment(fromDate, "DD-MM-YYYY").toDate()
          }
        }
      }] : [{
        $match: {
          submittedAt: {
            "$lte": moment(toDate, "DD-MM-YYYY").toDate(),
            "$gte": moment(fromDate, "DD-MM-YYYY").toDate()
          }
        }
      }]),
      {
        $group: {
          _id: {
            formId: '$formId',
            accessibility: '$accessibility',
          },
          responseCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'forms',
          let: { formId: '$_id.formId' }, // Adjusted to reference grouped formId
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$formId'] },
                    { $eq: ['$orgId', userDetails.orgId] },
                  ],
                },
                ...(title
                  ? { title: { $regex: title, $options: 'i' } }
                  : {}),
              },
            },
            { $project: { title: 1 } }, // Keep projection light
          ],
          as: 'form',
        },
      },
      { $unwind: { path: '$form', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          formId: '$_id.formId',
          accessibility: '$_id.accessibility', // Include accessibility in output
          responseCount: 1,
          formName: '$form.title',
        },
      },
    ];

    return this.submissionModel.aggregate<IGetSubmissionSummary>(pipeline).exec();
  }


}