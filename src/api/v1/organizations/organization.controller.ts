import { NextFunction } from 'express';
import { ObjectId } from 'mongoose';
import { Authorized, Body, CurrentUser, Delete, Get, HttpCode, JsonController, Param, Post, Put, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { UserRole } from '@common/types/roles';
import { auth } from '@middlewares/index';
import { IOrganization } from '@models/organization.model';
import { IUserSchema } from '@models/users.model';
import { OrganizationService } from '@services/v1';

import { OrganizationDto, OrganizationResponseSchema } from './dtos/organization.dto';
import InviteRegisterDto, { InviteRegisterArrayDto } from './dtos/invite-user-register.dto';

@JsonController('/v1/organizations', { transformResponse: false })
export class OrganizationController {
  private readonly organizationService = new OrganizationService();

  @Post('/')
  @HttpCode(201)
  @OpenAPI({ summary: 'Create a new organization', responses: OrganizationResponseSchema })
  @ResponseSchema(IOrganization)
  //@UseBefore(validationMiddleware(OrganizationDto, 'body'))
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN])
  async create(@Body() organizationData: OrganizationDto, @CurrentUser() user: IUserSchema) {
    const createdBy = user?._id?.toString();
    const organization = await this.organizationService.create({ ...organizationData, createdBy });
    return organization;
  }


  @Post('/user-invite')
  @HttpCode(201)
  @OpenAPI({ summary: 'register new user' })
  @ResponseSchema(IOrganization)
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN])
  //@UseBefore(validationMiddleware(RegisterDto, 'body'))
  async userInvite(@Body() userData: InviteRegisterArrayDto, @CurrentUser() userDetails: IUserSchema) {

    const modified = userData.users.map(user => {
      return {
        ...user,
        orgId: userDetails.orgId
      }
    });

    await this.organizationService.userInvitation(modified);

    return { message: "User successfully inviated" };
  }

  @Post('/map-to-user')
  @HttpCode(201)
  @OpenAPI({ summary: 'Create a new organization and mapp to user', responses: OrganizationResponseSchema })
  @ResponseSchema(IOrganization)
  //@UseBefore(validationMiddleware(OrganizationDto, 'body'))
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN])
  async mapTouser(@Body() organizationData: OrganizationDto, @CurrentUser() user: IUserSchema) {
    const createdBy = user?._id?.toString();
    const mappedOrgWithUser = await this.organizationService.mapToUser({ ...organizationData, createdBy });
    console.log({ mappedOrgWithUser });
    return mappedOrgWithUser;
  }

  @Get('/:id')
  @OpenAPI({ summary: 'Get an organization by ID', responses: OrganizationResponseSchema })
  @ResponseSchema(IOrganization)
  async get(@Param('id') id: ObjectId, next: NextFunction) {
    try {
      const organization = await this.organizationService.getById(id);
      if (!organization) {
        throw new Error('Organization not found');
      }
      return organization;
    } catch (err) {
      next(err);
    }
  }

  @Put('/:id')
  @OpenAPI({ summary: 'Update an existing organization', responses: OrganizationResponseSchema })
  @ResponseSchema(IOrganization)
  //@UseBefore(validationMiddleware(OrganizationDto, 'body'))
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN])
  async update(@Param('id') id: ObjectId, @Body() organizationData: Partial<IOrganization>) {
    const organization = await this.organizationService.update(id, organizationData);
    if (!organization) {
      throw new Error('Organization not found');
    }
    return organization;
  }

  @Delete('/:id')
  @OpenAPI({ summary: 'Delete an organization by ID', responses: OrganizationResponseSchema })
  @ResponseSchema(IOrganization)
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN])
  async delete(@Param('id') id: ObjectId) {
    const organization = await this.organizationService.delete(id);
    if (!organization) {
      throw new Error('Organization not found');
    }
    return organization;
  }

  @Get('/')
  @OpenAPI({ summary: 'Get all organizations', responses: OrganizationResponseSchema })
  @ResponseSchema(IOrganization)
  async getAll() {
    const organizations = await this.organizationService.findAll();
    return organizations;
  }
}
