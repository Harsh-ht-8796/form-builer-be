import { FilterQuery, ObjectId } from 'mongoose';

import CRUD from '@common/interfaces/crud.interface';
import Submission, { IGetSubmissionSummary, ISubmissionSchema } from '@models/submission.model';
import { SubmissionDto } from '@v1/submissions/dto/sumission.dto';

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

    async getSubmissionSummary(accessibility?: string) {
        const pipeline = [
            ...(accessibility ? [{ $match: { accessibility } }] : []),
            {
                $group: {
                    _id: '$formId',
                    responseCount: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'forms',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'form',
                },
            },
            {
                $unwind: {
                    path: '$form',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    formId: '$_id',
                    responseCount: 1,
                    formName: '$form.title', // 👈 put this last
                },
            },
        ];

        const summary = this.submissionModel.aggregate<IGetSubmissionSummary>(pipeline).exec();
        return summary;
    }

}