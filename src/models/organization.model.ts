import { IsNotEmpty, IsString } from 'class-validator';
import { Document, model, Schema, Types } from 'mongoose';

import { MODELS } from '@common/constants';
import ITimesStamp from '@common/interfaces/timestamp.interface';
import toJSON from '@utils/toJSON.plugin';

export class IOrganization extends ITimesStamp {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  locality!: string;

  @IsNotEmpty()
  createdBy!: Types.ObjectId;
}
export interface IOrganizationSchema extends Document, IOrganization {}

const organizationSchema = new Schema(
  {
    name: { type: String, required: true },
    locality: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: MODELS.USERS, required: true },
  },
  {
    timestamps: true,
  },
);

organizationSchema.plugin(toJSON);

export default model<IOrganizationSchema>(MODELS.ORGANIZATIONS, organizationSchema);
