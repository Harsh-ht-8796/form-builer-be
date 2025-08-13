import { OrgAdmin, SuperAdmin, TeamMember } from '@decorators';
import { Authorized, Body, CurrentUser, Delete, Get, JsonController, Param, Put, QueryParams, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { UserRole } from '@common/types/roles';
import auth from '@middlewares/auth.middleware';
import { IRoles, IUser, IUserSchema } from '@models/users.model';
import { UserService } from '@services/v1';
import UserSearchDto from './form-search.dto';
import { UserOrganizationResponseSchema } from '@v1/organizations/dtos/invite-organization.dto';
import { ObjectId } from 'mongoose';

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
    console.log({ id: userDetaills.id })
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
    console.log({ updateBody })
    const user = await this.userService.updateById(userDetaills.id, updateBody);
    return { user };
  }
}
