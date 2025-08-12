import { IsArray, IsBoolean, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

// OpenAPI response schema for form operations
export const FormResponseSchema = {
  '200': {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            orgId: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            createdBy: { type: 'string' },
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
          required: ['orgId', 'createdBy', 'fields', 'settings', 'status'],
        },
      },
    },
    description: 'Successful response',
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
    description: 'Form not found',
  },
};
class FieldDto {
  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsBoolean()
  required!: boolean;

  @IsOptional()
  position?: number;
}

class SettingsDto {
  @IsString()
  @IsOptional()
  backgroundColor!: string;

  @IsString()
  @IsOptional()
  headerImage?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  emailNotifications?: string[];

  @IsEnum(['public', 'private'])
  @IsOptional()
  visibility?: 'public' | 'private';
}

export default class FormDto {

  @IsArray()
  @IsOptional()
  fields?: FieldDto[];

  @IsObject()
  @IsOptional()
  settings?: SettingsDto;

  @IsEnum(['draft', 'published'])
  @IsOptional()
  status?: 'draft' | 'published' = "draft";

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsString()
  @IsOptional()
  logoImageUrl?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedDomains?: string[];

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  allowedEmails?: string[];

  @IsString()
  @IsOptional()
  createdBy?: String;
}
