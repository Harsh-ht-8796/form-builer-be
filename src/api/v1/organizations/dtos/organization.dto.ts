import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OrganizationDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  locality!: string;

  @IsString()
  @IsOptional()
  createdBy?: String;
}

export const OrganizationResponseSchema = {
  '201': {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            organization: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                },
                name: {
                  type: 'string',
                },
                locality: {
                  type: 'string',
                },
                createdBy: {
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
