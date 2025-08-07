import { IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { isString } from 'lodash';
import { ObjectId } from 'mongoose';

// OpenAPI response schema for submission operations
export const SubmissionResponseSchema = {
  '200': {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            formId: { type: 'string' },
            data: { type: 'object' },
            submittedBy: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['formId', 'data'],
        },
      },
    },
    description: 'Successful response',
  },
  '201': {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            formId: { type: 'string' },
            data: { type: 'object' },
            submittedBy: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['formId', 'data'],
        },
      },
    },
    description: 'Submission created successfully',
  },
  '404': {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    description: 'Submission or form not found',
  },
  '500': {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    description: 'Internal server error',
  },
};

// OpenAPI response schema for submission summary
export const SubmissionSummaryResponseSchema = {
  '200': {
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              formId: { type: 'string' },
              responseCount: { type: 'number' },
              formName: { type: 'string', nullable: true },
            },
            required: ['formId', 'responseCount'],
          },
        },
      },
    },
    description: 'Submission summary retrieved successfully',
  },
  '500': {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    description: 'Error fetching submission summary',
  },
};
export class SubmissionBaseDto {
  @IsObject()
  @IsNotEmpty()
  data!: Record<string, any>;

  @IsMongoId()
  @IsOptional()
  submittedBy?: ObjectId;

  @IsString()
  @IsOptional()
  accessibility?: string;
}

export class SubmissionParamsDto {
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  formId!: ObjectId;
}

export class SubmissionBodyDto extends SubmissionBaseDto {
}

export class SubmissionDto extends SubmissionBaseDto {
  @IsMongoId()
  @IsNotEmpty()
  formId!: ObjectId;
}