import { OrgAdmin, SuperAdmin, TeamMember } from '@decorators';
import { Authorized, BadRequestError, Body, CurrentUser, Delete, Get, HttpCode, JsonController, Param, Post, Put, QueryParams, Req, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import crypto from 'crypto';

import { UserRole } from '@common/types/roles';
import auth from '@middlewares/auth.middleware';
import usersModel, { IRoles, IUser, IUserSchema } from '@models/users.model';
import { UserService } from '@services/v1';
import UserSearchDto from './form-search.dto';
import { UserOrganizationResponseSchema } from '@v1/organizations/dtos/invite-organization.dto';
import { ObjectId } from 'mongoose';
import upload from '@v1/form/multer';
import path from 'path';
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import ChangePasswordDto from './changePassword.dto';


@UseBefore(auth())
@JsonController('/v1/users', { transformResponse: false })
export class UserController {
  private readonly userService = new UserService();

  @Get('/')
  @OpenAPI({
    summary: 'Get all users',
    description: 'Retrieve all users. Requires super admin or org admin role.',
    security: [{ bearerAuth: [] }],
  })
  @ResponseSchema(IUser, { isArray: true })
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN])
  async getAllUsers() {
    const users = await this.userService.findAll();
    return { users };
  }

  @Get('/roles')
  @OpenAPI({
    summary: 'Get all users roles',
    description: 'Retrieve all users. Requires super admin or org admin role.',
  })
  @ResponseSchema(IRoles, { isArray: true })
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN])
  async getAllUsersRoles() {
    const roles = await this.userService.getAllRoles();
    return { roles };
  }

  @Get('/me')
  @OpenAPI({
    summary: 'Get current user profile',
    description: 'Retrieve the profile of the currently authenticated user.',
    security: [{ bearerAuth: [] }],
  })
  @ResponseSchema(IUser)
  @Authorized([UserRole.SUPER_ADMIN])
  async getCurrentUser(@CurrentUser() userDetaills: IUserSchema) {
    const user = await this.userService.getById(userDetaills.id);
    return user;
  }

  @Get('/by-org')
  @OpenAPI({
    summary: 'Get current user profile',
    description: 'Retrieve the profile of the currently authenticated user.',
    security: [{ bearerAuth: [] }],
  })
  @ResponseSchema(IUser)
  @Authorized([UserRole.SUPER_ADMIN])
  async getUserByOrg(@QueryParams() query: UserSearchDto, @CurrentUser() user: IUser) {
    const { limit = 10, page = 0, email, ...rest } = query;

    const users = await this.userService.findAllByOrg({
      filter: {
        orgId: user.orgId,
        ...(email ? { email } : {})
      }
    })

    return { users }
  }

  @Get('/admins')
  @OpenAPI({
    summary: 'Get all admin users',
    description: 'Retrieve all users with admin privileges. Requires super admin role.',
    security: [{ bearerAuth: [] }],
  })
  @ResponseSchema(IUser, { isArray: true })
  @UseBefore(SuperAdmin())
  async getAdmins() {
    const admins = await this.userService.findByRoles([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]);
    return { admins };
  }

  @Get('/team-members')
  @OpenAPI({
    summary: 'Get all team members',
    description: 'Retrieve all team members. Requires org admin or super admin role.',
    security: [{ bearerAuth: [] }],
  })
  @ResponseSchema(IUser, { isArray: true })
  @UseBefore(OrgAdmin())
  async getTeamMembers() {
    const teamMembers = await this.userService.findByRoles([UserRole.TEAM_MEMBER]);
    return { teamMembers };
  }

  @Get('/regular-users')
  @OpenAPI({
    summary: 'Get all regular users',
    description: 'Retrieve all regular users. Requires team member or higher role.',
    security: [{ bearerAuth: [] }],
  })
  @ResponseSchema(IUser, { isArray: true })
  @UseBefore(TeamMember())
  async getRegularUsers() {
    const regularUsers = await this.userService.findByRoles([UserRole.USER]);
    return { users: regularUsers };
  }

  @Delete('/delete-profile-image')
  @HttpCode(200)
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MEMBER])
  async deleteProfileImage(@CurrentUser() user: IUserSchema) {
    // 1. Find user in DB
    const userDoc = await usersModel.findById(user.id)
    if (!userDoc || !userDoc.profileImage) {
      throw new BadRequestError('No profile image found to delete');
    }

    // 2. Resolve file path
    const relativePath = userDoc.profileImage.startsWith('/uploads/')
      ? userDoc.profileImage
      : `/uploads/${userDoc.profileImage}`;
    const filePath = path.join(process.cwd(), relativePath);

    // 3. Delete file from disk (if exists)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 4. Update user doc to remove profileImage
    await usersModel.updateOne({ _id: user.id }, { $unset: { profileImage: '' } });

    return {
      message: 'Profile image deleted successfully',
    };
  }

  @Delete('/:id')
  @OpenAPI({ summary: 'Delete a user by ID', responses: UserOrganizationResponseSchema })
  @ResponseSchema(IUser)
  @UseBefore(auth())
  @Authorized([UserRole.SUPER_ADMIN,])
  async delete(@Param('id') id: ObjectId) {
    const user = await this.userService.delete(id);
    if (!user) {
      throw new Error('User not found');

    }
    return { message: "User deleted successfully" };
  }


  @Put('/')
  @OpenAPI({
    summary: 'Update  users',
    description: 'Update  users.',
  })
  @ResponseSchema(IUser)
  async updateUser(@CurrentUser() userDetaills: IUserSchema, @Body() updateBody: Partial<IUser>) {
    const user = await this.userService.updateById(userDetaills.id, updateBody);
    return { user };
  }


  @Post('/upload-images')
  @HttpCode(201)
  @OpenAPI({ summary: 'Upload cover and logo images (multipart/form-data)' })
  @UseBefore(upload.fields([
    { name: 'profileImage', maxCount: 1 }]))
  @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MEMBER])
  async uploadImages(
    @CurrentUser() user: IUserSchema,
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
      const updatedForm = await usersModel.updateOne({ _id: user.id }, { [`${key}`]: `/uploads/${file.filename}` });
      console.log({ updatedForm })
      result[`${key}Hash`] = hash;
    }

    return result;
  }


  @Post('/change-password')
  @OpenAPI({ summary: 'Change current user password' })
  //@UseBefore(validationMiddleware(ChangePasswordDto, 'body'))
  async changePassword(
    @Body() userData: ChangePasswordDto,
    @CurrentUser() currentUser: IUserSchema
  ) {
    return await this.userService.changePassword(
      currentUser.id,
      userData.oldPassword,
      userData.newPassword
    );
  }


}
