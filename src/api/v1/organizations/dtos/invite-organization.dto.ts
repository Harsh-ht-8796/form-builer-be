import { IsString } from 'class-validator';
import { Types } from 'mongoose';
import InviteRegisterDto from './invite-user-register.dto';


export class UserOrganizationWithOrgIdDto extends InviteRegisterDto {
  @IsString()
  orgId!: Types.ObjectId;
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
