import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEmail, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import mongoose, { Document, ObjectId, Schema, Types } from 'mongoose';
import bcrypt from 'bcrypt';

import { MODELS } from '@common/constants';
import ITimesStamp from '@common/interfaces/timestamp.interface';
import { UserRole } from '@common/types/roles';
import toJSON from '@utils/toJSON.plugin';
import { IOrganization, IOrganizationSchema } from './organization.model';

// Assuming you have an IOrganization interface/class defined in your project

export class IUser extends ITimesStamp {
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsBoolean()
  isEmailVerified!: boolean;

  @IsOptional()
  orgId?: ObjectId;

  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles!: UserRole[];

  @IsString()
  @IsOptional()
  profileImage!: string;
}

// New class for user with organization populated data
export class IUserWithOrganization extends ITimesStamp {
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsBoolean()
  isEmailVerified!: boolean;

  // Instead of just an orgId, we now include the full organization object.
  @IsOptional()
  @ValidateNested()
  @Type(() => IOrganization)
  orgId?: IOrganizationSchema;

  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles!: UserRole[];

  @IsString()
  @IsOptional()
  profileImage!: string;
}

export class IRoles {
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles!: UserRole[];
}


export interface IUserSchema extends Document, IUser {}

const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      maxlength: 20,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      private: true,
    },
    orgId: {
      type: Types.ObjectId,
      default: null,
      ref: MODELS.ORGANIZATIONS,
      required: false
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [UserRole.USER],
      required: true,
    },
    profileImage: {
      type: String,
      required: false,
      default: null
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  const user = this as unknown as IUserSchema;

  if (user.isModified('password') && typeof user.password === 'string') {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.pre('insertMany', async function (next, docs: IUserSchema[]) {
  for (const doc of docs) {
    if (typeof doc.password === 'string') {
      doc.password = await bcrypt.hash(doc.password, 8);
    }
  }
  next();
});
userSchema.plugin(toJSON);

export default mongoose.model<IUserSchema>(MODELS.USERS, userSchema);
