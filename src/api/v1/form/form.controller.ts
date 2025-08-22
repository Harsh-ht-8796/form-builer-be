
import { NextFunction } from 'express';
import { ObjectId } from 'mongoose';
import { Authorized, Body, CurrentUser, Delete, Get, HttpCode, JsonController, Param, Post, Put, QueryParam, QueryParams, UseBefore, Req, BadRequestError } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import crypto from 'crypto';
import { UserRole } from '@common/types/roles';
import { auth, conditionalAuth } from '@middlewares/index';
import formModel, { IForm } from '@models/form.model';
import { IUserSchema } from '@models/users.model';
import { FormService } from '@services/v1';
import path from 'path';
import fs from 'fs';
import FormDto, { DeleteImage, FormResponseSchema } from './dtos/form.dto';
import FormSearchDto from './dtos/form-search.dto';
import upload from './multer';
import isFormExists from '@middlewares/is.form.exists';
import { IsArray, IsBoolean, IsEmail, IsIn, IsOptional, IsString } from 'class-validator';
import { fileTypeFromBuffer } from 'file-type';

class UpdateVisibilityDto {
  @IsArray()
  @IsIn(['public', 'private', 'domain_restricted'], { each: true })
  visibility!: ("public" | "private" | "domain_restricted")[];

  @IsArray()
  @IsOptional()
  @IsEmail({}, { each: true })
  allowedEmails?: string[];
}

class UpdateIsReceiveResponse {
  @IsBoolean()
  isActive;
}

@JsonController('/v1/forms', { transformResponse: false })
export class FormController {
  private readonly formService = new FormService();

  @Post('/')
  @HttpCode(201)
  @OpenAPI({ summary: 'Create a new form', responses: FormResponseSchema })
  @ResponseSchema(IForm)
  //@UseBefore(validationMiddleware(FormDto, 'body'))
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MEMBER])
  async create(@Body() formData: FormDto, @CurrentUser() user: IUserSchema) {
    const createdBy = user?._id?.toString();
    const orgId = user?.orgId;
    console.log(orgId)
    const form = await this.formService.create({ ...formData, status: "draft", createdBy, ...(orgId && orgId ? { orgId: orgId as unknown as ObjectId } : {}) });
    return form;
  }

  @Get('/')
  @OpenAPI({ summary: 'Get all forms', responses: FormResponseSchema })
  @ResponseSchema(IForm)
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole])
  async getAll(@QueryParam('limit') limit: number = 10, @QueryParam('page') page: number = 0) {
    const { docs, meta } = await this.formService.findAll({ limit, page });
    return { docs, meta };
  }

  @Get('/search')
  @OpenAPI({ summary: 'Search forms by title', responses: FormResponseSchema })
  @ResponseSchema(IForm)
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MEMBER])
  async search(@QueryParams() query: FormSearchDto, @CurrentUser() user: IUserSchema) {
    const { limit = 10, page = 0, ...rest } = query;
    console.log('Search query:', rest);
    const { docs, meta } = await this.formService.findAll({ filter: rest, limit, page, user });
    return { docs, meta };
  }

  @Get('/received')
  @OpenAPI({ summary: 'Get all forms', responses: FormResponseSchema })
  @ResponseSchema(IForm)
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole])
  async getAllUserReceivedForm(@CurrentUser() userDetails: IUserSchema, @QueryParams() query: FormSearchDto) {
    const { limit, page, ...rest } = query;

    const { docs, meta } = await this.formService.findAllReceivedForm({ filter: rest, limit, page, user: userDetails });
    return { docs, meta };
  }
  @Get('/:id')
  @OpenAPI({ summary: 'Get a form by ID', responses: FormResponseSchema })
  @ResponseSchema(IForm)
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole])
  async getUserForm(@Param('id') id: ObjectId) {
    try {
      const form = await this.formService.getByIdFilter(id, {
        isActive: true,
        "status": "draft"
      });
      if (!form) {
        throw new Error('Form not found');
      }
      return form;
    } catch (err) {
      console.log(err)
      throw new Error(err.message || "Something goes wrong")
    }
  }

  @Get('/:id/active-status')
  @OpenAPI({ summary: 'Get a form by ID', responses: FormResponseSchema })
  @ResponseSchema(IForm)
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole])
  async getFormStatus(@Param('id') id: ObjectId) {
    try {
      const form = await this.formService.getFormStatusById(id);
      if (!form) {
        throw new Error('Form not found');
      }
      return form;
    } catch (err) {
      console.log(err)
      throw new Error("Something goes wrong")
    }
  }

  @Get('/:id/user-view')
  @OpenAPI({ summary: 'Get a form by ID', responses: FormResponseSchema })
  @ResponseSchema(IForm)
  @UseBefore(conditionalAuth())
  async get(@Param('id') id: ObjectId, next: NextFunction) {
    try {
      const form = await this.formService.getById(id);
      if (!form) {
        throw new Error('Form not found');
      }
      return form;
    } catch (err) {
      throw new Error(err?.message || "Something goes wrong")
    }
  }

  @Put('/:id/update-visibility')
  @OpenAPI({ summary: 'Update form visibility and allowed emails', responses: FormResponseSchema })
  @ResponseSchema(IForm)
  // @UseBefore(validationMiddleware(UpdateVisibilityDto, 'body'))
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MEMBER])
  async updateVisibility(@Param('id') id: ObjectId, @Body() updateData: UpdateVisibilityDto) {
    const form = await this.formService.getById(id);
    if (!form) {
      throw new Error('Form not found');
    }
    const allowedVisibilyStatus = ["public", "private", "domain_restricted"];

    const isPublished = allowedVisibilyStatus.some((status: "public" | "private" | "domain_restricted") => {
      return updateData.visibility.includes(status);
    });

    const updatedForm = await this.formService.update(id, {
      settings: {
        ...form.settings,
        visibility: updateData.visibility,

      },
      status: isPublished ? "published" : "draft",
      allowedEmails: updateData.allowedEmails
    });
    if (!updatedForm) {
      throw new Error('Form update failed');
    }
    return updatedForm;
  }

  @Put('/:id/is-receive-response')
  @OpenAPI({ summary: 'Update form visibility and allowed emails', responses: FormResponseSchema })
  @ResponseSchema(IForm)
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MEMBER])
  async isReceiveResponse(@Param('id') id: ObjectId, @Body() updateData: UpdateIsReceiveResponse) {
    const form = await this.formService.getByIdForStatus(id);
    console.log({ form })
    if (!form) {
      throw new Error('Form not found 1');
    }
    const { isActive } = updateData
    const updatedForm = await this.formService.update(id, {
      isActive
    });
    if (!updatedForm) {
      throw new Error('Form update failed');
    }
    return updatedForm;
  }


  @Get('/:id/visibility')
  @OpenAPI({ summary: 'Get form visibility and allowed emails', responses: { '200': { description: 'Visibility and allowed emails' } } })
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MEMBER])
  async getVisibilityAndEmails(@Param('id') id: ObjectId, next: NextFunction) {
    try {
      const result = await this.formService.getVisibilityAndEmails(id);
      if (!result) {
        throw new Error('Form not found');
      }
      return result;
    } catch (err) {
      next(err);
    }
  }

  @Put('/:id')
  @OpenAPI({ summary: 'Update an existing form', responses: FormResponseSchema })
  @ResponseSchema(IForm)
  //@UseBefore(validationMiddleware(FormDto, 'body'))
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MEMBER])
  async update(@Param('id') id: ObjectId, @Body() formData: Partial<IForm>) {
    const form = await this.formService.update(id, formData);
    if (!form) {
      throw new Error('Form not found');
    }
    return form;
  }


  @Delete('/:id/image')
  @OpenAPI({ summary: 'Delete a form by ID', responses: FormResponseSchema })
  @ResponseSchema(IForm)
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MEMBER])
  async deleteImage(@Param('id') id: ObjectId, @Body() body: DeleteImage) {
    const form = await this.formService.deleteCoverOrLogo(id, body);
    if (!form) {
      throw new Error('Form not found');
    }
    return form;
  }
  @Delete('/:id')
  @OpenAPI({ summary: 'Delete a form by ID', responses: FormResponseSchema })
  @ResponseSchema(IForm)
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MEMBER])
  async delete(@Param('id') id: ObjectId) {
    const form = await this.formService.delete(id);
    if (!form) {
      throw new Error('Form not found');
    }
    return form;
  }

  @Post('/upload-images/:id')
  @HttpCode(201)
  @OpenAPI({ summary: 'Upload cover and logo images (multipart/form-data)' })
  @UseBefore(upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'logoImage', maxCount: 1 }
  ]))
  @UseBefore(auth())
  @UseBefore(isFormExists())
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MEMBER])
  async uploadImages(
    @CurrentUser() user: IUserSchema,
    @Param('id') id: string,
    @Req() req: any
  ) {
    const files = req.files as Record<string, Express.Multer.File[]>;
    if (!files || Object.keys(files).length === 0) {
      throw new BadRequestError('No images uploaded');
    }

    const result: Record<string, any> = {};

    for (const key of Object.keys(files)) {
      const arr = files[key];
      if (!arr || arr.length === 0) continue;

      const file = arr[0];
      const fullPath = path.join(file.destination!, file.filename);
      const buffer = fs.readFileSync(fullPath);

      const type = await fileTypeFromBuffer(buffer);
      if (!type || !['image/jpeg', 'image/png', 'image/gif'].includes(type.mime)) {
        fs.unlinkSync(fullPath);
        throw new BadRequestError(`${key} has invalid content`);
      }

      const hash = crypto.createHash('sha256').update(buffer).digest('hex');

      result[`${key}Url`] = `/uploads/${file.filename}`;
      const updatedForm = await formModel.updateOne({ _id: id }, { [`${key}`]: `/uploads/${file.filename}` });
      console.log({ updatedForm })
      result[`${key}Hash`] = hash;
    }

    return result;
  }

  @Post('/:id/publish')
  @OpenAPI({ summary: 'Publish a form by ID', responses: FormResponseSchema })
  @ResponseSchema(IForm)
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MEMBER])
  async publish(@Param('id') id: ObjectId) {
    const form = await this.formService.publish(id);
    if (!form) {
      throw new Error('Form not found');
    }
    return form;
  }
}