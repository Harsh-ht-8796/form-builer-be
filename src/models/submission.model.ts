import { Document, model, ObjectId, Query, Schema, Types } from 'mongoose';
import { IsDate, IsMongoId, IsObject, IsOptional, IsString } from 'class-validator';

import { MODELS } from '@common/constants';
import ITimesStamp from '@common/interfaces/timestamp.interface';
import Form from './form.model';

// Interface used for summaries
export interface IGetSubmissionSummary {
  _id: Types.ObjectId;
  responseCount: number;
  form: {
    _id: Types.ObjectId;
    title: string;
  };
}

// Class with validation decorators
export class ISubmission extends ITimesStamp {
  @IsMongoId()
  formId!: Types.ObjectId;

  @IsDate()
  submittedAt!: Date;

  @IsObject()
  data!: Record<string, any>;

  @IsOptional()
  @IsString()
  accessibility?: string;

  @IsOptional()
  @IsMongoId()
  submittedBy?: ObjectId;

  @IsOptional()
  @IsMongoId()
  orgId?: ObjectId;
}

// Extend Document to use with Mongoose
export interface ISubmissionSchema extends Document, ISubmission { }

// Mongoose schema
const submissionSchema = new Schema<ISubmissionSchema>(
  {
    formId: { type: Schema.Types.ObjectId, ref: MODELS.FORMS, required: true },
    submittedAt: { type: Date, default: Date.now },
    orgId: {
      type: Schema.Types.ObjectId,
      default: null,
      required: false,
      ref: MODELS.ORGANIZATIONS
    },
    data: { type: Schema.Types.Mixed, required: true },
    accessibility: { type: String, default: 'public' },
    submittedBy: { type: Schema.Types.ObjectId, ref: MODELS.USERS },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to validate formId
submissionSchema.pre<ISubmissionSchema>('save', async function (next) {
  try {
    if (this.formId) {
      const formExists = await Form.exists({ _id: this.formId, isActive: true });
      if (!formExists) {
        throw new Error('Invalid formId: Form does not exist');
      }
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-update hooks to validate formId when updating
submissionSchema.pre<Query<any, ISubmissionSchema>>(['updateOne', 'findOneAndUpdate'], async function (next) {
  try {
    const update = this.getUpdate() as { formId?: Types.ObjectId };
    if (update.formId) {
      const formExists = await Form.exists({ _id: update.formId });
      if (!formExists) {
        throw new Error('Invalid formId: Form does not exist');
      }
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Export Mongoose model
export default model<ISubmissionSchema>(MODELS.SUBMISSIONS, submissionSchema);
