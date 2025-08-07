import { IsArray, IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

// OpenAPI response schema for form operations
export const FormResponseSchema = {
  '200': {
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            orgId: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            fields: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  label: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  position: { type: 'number' },
                  required: { type: 'boolean' },
                },
                required: ['type', 'label', 'required'],
              },
            },
            settings: {
              type: 'object',
              properties: {
                backgroundColor: { type: 'string' },
                headerImage: { type: 'string', nullable: true },
                emailNotifications: { type: 'array', items: { type: 'string' } },
                visibility: { type: 'string', enum: ['public', 'private'] },
              },
              required: ['backgroundColor', 'emailNotifications', 'visibility'],
            },
            status: { type: 'string', enum: ['draft', 'published'] },
          },
          required: ['orgId', 'fields', 'settings', 'status'],
        },
      },
    },
    description: 'Successful response',
  },
  '404': {
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    description: 'Form not found',
  },
};
class FieldDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsBoolean()
  required: boolean;

  @IsOptional()
  position?: number;
}

class SettingsDto {
  @IsString()
  @IsNotEmpty()
  backgroundColor: string;

  @IsString()
  @IsOptional()
  headerImage?: string;

  @IsArray()
  @IsString({ each: true })
  emailNotifications: string[];

  @IsEnum(['public', 'private'])
  visibility: 'public' | 'private';
}

export default class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  orgId: string;

  @IsArray()
  @IsNotEmpty()
  fields: FieldDto[];

  @IsObject()
  @IsNotEmpty()
  settings: SettingsDto;

  @IsEnum(['draft', 'published'])
  status: 'draft' | 'published';

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsString()
  @IsOptional()
  logoImageUrl?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedDomains?: string[];

  @IsArray()
  @IsString({ each: true }) 
  @IsOptional()
  alowedEmails?: string[];

  @IsString()
  @IsOptional()
  createdBy?: String;
}
