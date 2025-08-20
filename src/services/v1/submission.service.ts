import { FilterQuery, ObjectId, Types } from 'mongoose';
import CRUD from '@common/interfaces/crud.interface';
import Submission, { IGetSubmissionSummary, ISubmissionSchema } from '@models/submission.model';
import { FieldQueryDto, SubmissionDto, SubmissionSummaryQueryDto } from '@v1/submissions/dto/sumission.dto';
import { IUserSchema } from '@models/users.model';
import moment from 'moment';
import formModel from '@models/form.model';
import { isArray } from 'lodash';

export interface QuestionAnswer {
  question: string;
  answer: any;
  fieldId: string;
}

interface IUserLite {
  _id: string;
  email: string;
}

interface ISubmissionWithUser {
  _id: ObjectId;
  submittedAt: Date;
  data: Record<string, any>;
  submittedBy?: IUserLite | null; // after populate
}

export interface FieldResponse {
  submissions: {
    submissionId: Types.ObjectId;
    submittedAt: Date;
    answers: QuestionAnswer[];
  }[];
  meta: {
    totalSubmissions: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export interface SubmissionAnswersResponse {
  submissions: {
    submissionId: Types.ObjectId;
    submittedAt: Date;
    answers: QuestionAnswer[];
  }[];
  meta: {
    totalSubmissions: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export class SubmissionService implements CRUD<ISubmissionSchema> {
  private readonly submissionModel = Submission;
  private readonly formModel = formModel;

  async create(data: SubmissionDto): Promise<ISubmissionSchema> {
    return this.submissionModel.create(data);
  }

  async findAll(
    filter: FilterQuery<ISubmissionSchema> = {},
    limit = 10,
    page = 0
  ): Promise<{ docs: ISubmissionSchema[]; meta: { totalDocs: number; totalPages: number; page: number, limit: number } }> {
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
        limit
      },
    };
  }

  async findSubmissionsByFormId(
    formId: ObjectId,
    { limit = 10, page = 0, fieldIds }: { limit?: number; page?: number; fieldIds?: [] }
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

  async getOverViewCard(userDetails: IUserSchema) {
    // Fetch total number of forms for the user's organization
    const allFormCount = await this.formModel.countDocuments({
      orgId: userDetails.orgId,
    });

    // Fetch total number of submissions for the user's organization
    const totalResponse = await this.submissionModel.countDocuments({
      orgId: userDetails.orgId,
    });

    // Calculate average completion rate for private forms
    let avgCompletionRate = "0%";
    const privateForms = await this.formModel.countDocuments({
      orgId: userDetails.orgId,
      'settings.visibility': { $in: ['private'] },
      status: 'published', // Only consider published forms
    });

    if (privateForms > 0) {
      const privateFormSubmissions = await this.submissionModel.countDocuments({
        orgId: userDetails.orgId,
        accessibility: 'private',
      });

      // Calculate completion rate: (submissions for private forms / private forms)
      // Assuming each form expects at least one submission for completion
      const completionRate = (privateFormSubmissions / privateForms) * 100;
      avgCompletionRate = `${Math.round(completionRate)}%`;
    }

    // Optional: Calculate percentage change (e.g., week-over-week) for forms and responses
    // For simplicity, let's assume we compare with the previous week's data
    const oneWeekAgo = moment().subtract(7, 'days').toDate();

    const recentForms = await this.formModel.countDocuments({
      orgId: userDetails.orgId,
      createdAt: { $gte: oneWeekAgo },
    });
    const previousForms = await this.formModel.countDocuments({
      orgId: userDetails.orgId,
      createdAt: { $lt: oneWeekAgo },
    });
    const formGrowth = previousForms > 0 ? ((recentForms / previousForms) * 100).toFixed(1) : "0.0";

    const recentResponses = await this.submissionModel.countDocuments({
      orgId: userDetails.orgId,
      submittedAt: { $gte: oneWeekAgo },
    });
    const previousResponses = await this.submissionModel.countDocuments({
      orgId: userDetails.orgId,
      submittedAt: { $lt: oneWeekAgo },
    });
    const responseGrowth = previousResponses > 0 ? ((recentResponses / previousResponses) * 100).toFixed(1) : "0.0";

    return [
      {
        label: "Total Forms",
        value: allFormCount,
        percentage: `${formGrowth}%`, // Week-over-week growth
        id: "total_form",
      },
      {
        label: "Total Responses",
        value: totalResponse,
        percentage: `${responseGrowth}%`, // Week-over-week growth
        id: "total_response",
      },
      {
        label: "Avg. Completion Rate (Private)",
        value: avgCompletionRate,
        percentage: "N/A", // No growth metric for completion rate
        id: "avg_completion_rate_private",
      },
    ];
  }

  async getFieldAnswers(formId: ObjectId, query: FieldQueryDto) {
    const { page = 0, limit = 10 } = query;

    // Validate formId
    const form = await this.formModel.findById(formId).lean();
    if (!form) {
      throw new Error('Form not found');
    }

    // Ensure page index is within bounds of form.fields
    if (!form.fields || page < 0 || page >= form.fields.length) {
      throw new Error('Invalid field index (page)');
    }

    console.log({ form })
    // Pick field based on page index
    const field = form.fields[page];
    const fieldId = field.id;
    const fieldTitle = field.title;
    console.log({ field })

    // Fetch submissions with pagination for this field
    const totalSubmissions = await this.submissionModel.countDocuments({
      formId,
      [`data.${fieldId}`]: { $exists: true },
    });

    const submissions = await this.submissionModel
      .find({
        formId,
        [`data.${fieldId}`]: { $exists: true },
      })
      .populate({
        path: "submittedBy",
        select: "email",
      })
      .sort({ submittedAt: -1 })
      .lean();

    // Format answers
    const formattedSubmissions = submissions.map(submission => ({
      submissionId: submission._id,
      submittedAt: submission.submittedAt,
      submittedBy: submission.submittedBy,
      answer: isArray(submission.data[fieldId]) ? submission.data[fieldId] : [submission.data[fieldId]],
    }));

    return {
      submissions: formattedSubmissions,
      field,
      meta: {
        fieldIndex: page, // tells which field you’re looking at
        fieldId,
        totalSubmissions,
        totalPages: Math.ceil(totalSubmissions / limit) || 0,
        page: page ?? 0,
        limit: Math.min(limit, 100),
      },
    };
  }

  async getFieldAnswersWithUsers(formId: ObjectId, query: FieldQueryDto) {
    const { page = 0, limit = 10 } = query;

    // Validate formId
    const form = await this.formModel.findById(formId).lean();
    if (!form) {
      throw new Error("Form not found");
    }

    if (!form.fields || page < 0 || page >= form.fields.length) {
      throw new Error("Invalid field index (page)");
    }

    // Pick field based on page index
    const field = form.fields[page];
    const fieldId = field.id;
    const fieldTitle = field.title;

    // If field type is short-text or long-text, use getFieldAnswers logic
    if (field.type === "short-text" || field.type === "long-text") {
      // Fetch submissions with pagination for this field
      const totalSubmissions = await this.submissionModel.countDocuments({
        formId,
        [`data.${fieldId}`]: { $exists: true },
      });

      const submissions = await this.submissionModel
        .find({
          formId,
          [`data.${fieldId}`]: { $exists: true },
        })
        .populate({
          path: "submittedBy",
          select: "email _id",
        })
        .sort({ submittedAt: -1 })
        .lean();

      // Format answers
      console.log(JSON.stringify(submissions))
      const formattedSubmissions = submissions.map(submission => ({
        submissionId: submission._id,
        submittedAt: submission.submittedAt,
        answers: [{
          question: fieldTitle,
          answer: submission.data[fieldId],
          fieldId,
        }],
      }));

      return {
        submissions: formattedSubmissions,
        meta: {
          totalSubmissions,
          totalPages: Math.ceil(form.fields.length / limit) || 0,
          page: page ?? 0,
          limit: Math.min(limit, 100),
        },
      } as SubmissionAnswersResponse;
    }

    // Original logic for fields with options (e.g., multiple-choice)
    if (!field.options || !Array.isArray(field.options)) {
      throw new Error("Field does not have options (not multiple-choice type)");
    }

    // Get all submissions where this field has an answer
    const submissions = await this.submissionModel
      .find({
        formId,
        [`data.${fieldId}`]: { $exists: true },
      })
      .populate({
        path: "submittedBy",
        select: "_id email",
      })
      .sort({ submittedAt: -1 })
      .lean<ISubmissionWithUser[]>();

    // Map option -> array of users
    const optionMap: Record<
      string,
      { option: string; users: { _id: string; email: string }[] }
    > = {};

    // Initialize map with all options (even if no one selected them)
    field.options.forEach((opt: string) => {
      optionMap[opt] = { option: opt, users: [] };
    });

    // Iterate over submissions and fill users
    submissions?.forEach((submission) => {
      const submittedUser = submission.submittedBy as
        | { _id: string; email: string }
        | null;

      const answer = submission.data[fieldId];
      const answers = Array.isArray(answer) ? answer : [answer];

      answers.forEach((ans) => {
        if (optionMap[ans] && submittedUser) {
          optionMap[ans].users.push({
            _id: submittedUser._id.toString(),
            email: submittedUser.email,
          });
        } else {
          optionMap[ans].users.push({
            _id: "unknwon id",
            email: "unknwon email",
          });
        }
      });
    });

    return {
      field: {
        id: fieldId,
        title: fieldTitle,
        type: field.type,
        options: field.options,
      },
      results: Object.values(optionMap),
      meta: {
        totalSubmissions: submissions.length,
        totalPages: Math.ceil(form.fields.length / limit) || 0,
        fieldIndex: page,
        page: page ?? 0,
        limit: limit
      },
    };
  }
}