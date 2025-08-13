import { IsString } from 'class-validator';
import InviteRegisterDto from './invite-user-register.dto';
import { ObjectId } from 'mongoose';


export class UserOrganizationWithOrgIdDto extends InviteRegisterDto {
  @IsString()
  orgId!: ObjectId;
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
