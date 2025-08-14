import bcrypt from 'bcrypt';
import { IsArray, IsBoolean, IsEmail, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import mongoose, { Document, ObjectId, Schema, Types } from 'mongoose';

import { MODELS } from '@common/constants';
import ITimesStamp from '@common/interfaces/timestamp.interface';
import { UserRole } from '@common/types/roles';
import toJSON from '@utils/toJSON.plugin';

export class IUser extends ITimesStamp {
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsBoolean()
  isEmailVerified!: boolean;

  @IsMongoId()
  orgId?: ObjectId;

  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles!: UserRole[];

  @IsString()
  @IsOptional()
  profileImage: string;
}

export class IRoles {
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles!: UserRole[];
}

export interface IUserSchema extends Document, IUser { }

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
