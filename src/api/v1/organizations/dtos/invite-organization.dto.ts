import { IsString, ValidateNested } from 'class-validator';
import InviteRegisterDto from './invite-user-register.dto';
import { ObjectId } from 'mongoose';
import { Type } from 'class-transformer';
import { IOrganization } from '@models/organization.model';


export class UserOrganizationWithOrgIdDto extends InviteRegisterDto {
  @ValidateNested()
  @Type(() => Object) // Or a specific DTO if you have one for IOrganization
  orgId!: IOrganization;
}

export const UserOrganizationResponseSchema = {
  '201': {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            user_organization_details: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                },
                roles: {
                  type: 'string',
                },
              },
            },
          },
          required: ['organization'],
        },
      },
    },
    description: 'Organization created successfully',
  },
};
