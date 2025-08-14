import { Document, model, ObjectId, Schema } from 'mongoose';
import { Types } from 'mongoose';

import { MODELS } from '@common/constants';
import Organization from './organization.model';
import ITimesStamp from '@common/interfaces/timestamp.interface';
import { IsArray, IsBoolean, IsEmail, IsIn, IsMongoId, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class IFormSettings {
  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  headerImage?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  emailNotifications?: string[];

  @IsArray()
  @IsIn(['public', 'private', 'domain_restricted'], { each: true })
  visibility!: ('public' | 'private' | 'domain_restricted')[];
}

export class IFormField {
  @IsString()
  id!: string;

  @IsIn([
    "short-text",
    "long-text",
    "multiple-choice",
    "dropdown",
    "checkbox"
  ])
  type!: 'short-text' | 'long-text' | 'multiple-choice' | 'dropdown' | 'checkbox';

  @IsString()
  title!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsIn([
    "text",
    "textarea",
    "radio",
    "select",
    "checkbox"
  ])
  fieldType!: 'text' | 'textarea' | 'radio' | 'select' | 'checkbox';

  @IsNumber()
  order!: number;

  @IsBoolean()
  required!: boolean;
}

export class IForm extends ITimesStamp {
  @IsMongoId()
  orgId!: ObjectId;

  @IsMongoId()
  createdBy!: ObjectId;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IFormField)
  fields?: IFormField[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedDomains?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  allowedEmails?: string[];

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  logoImageUrl?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  logoImage?: string;

  @ValidateNested()
  @Type(() => IFormSettings)
  settings?: IFormSettings;

  @IsIn(['draft', 'published'])
  status!: 'draft' | 'published';

  @IsBoolean()
  isActive?: boolean;
}

export interface IFormSchema extends Document, IForm { }

const formSchema = new Schema({
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coverImage: { type: String, default: '' },
  logoImage: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  allowedDomains: { type: [String], default: [] },
  allowedEmails: { type: [String], default: [] },
  fields: [
    {
      id: { type: String, required: true },
      type: { type: String, required: true },
      fieldType: {
        type: String, enum: [
          "checkbox",
          "radio",
          "select",
          "textarea",
          "text"
        ], default: 'text', required: true
      },
      title: { type: String, required: true },
      options: [String],
      order: { type: Number, default: 0 },
      required: { type: Boolean, default: false },
    },
  ],
  status: {
    type: String,
    default: ["draft"],
    required: false
  },

  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    backgroundColor: { type: String, default: 'cyan' },
    headerImage: String,
    emailNotifications: { type: [String], default: [] },
    visibility: {
      type: [String], // make it an array
      enum: ['public', 'private', 'domain_restricted'],
      default: [], // default as an array
    },
  }
}, {
  timestamps: true,
});

// Pre-save hook to validate orgId
formSchema.pre('save', async function (next) {
  try {
    if (this.orgId) {
      const orgExists = await Organization.exists({ _id: this.orgId });
      if (!orgExists) {
        throw new Error('Invalid orgId: Organization does not exist');
      }
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-update hook to validate orgId for update operations
formSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {
  try {
    const update = this.getUpdate() as { orgId?: Types.ObjectId };
    if (update.orgId) {
      const orgExists = await Organization.exists({ _id: update.orgId });
      if (!orgExists) {
        throw new Error('Invalid orgId: Organization does not exist');
      }
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default model<IFormSchema>(MODELS.FORMS, formSchema);