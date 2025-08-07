import { OrgAdmin, SuperAdmin, TeamMember } from '@decorators';
import { Authorized, CurrentUser, Get, JsonController, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { UserRole } from '@common/types/roles';
import auth from '@middlewares/auth.middleware';
import { IUser } from '@models/users.model';
import { UserService } from '@services/v1';

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

  @Get('/me')
  @OpenAPI({
    summary: 'Get current user profile',
    description: 'Retrieve the profile of the currently authenticated user.',
    security: [{ bearerAuth: [] }],
  })
  @ResponseSchema(IUser)
  @Authorized([UserRole.SUPER_ADMIN])
  getCurrentUser(@CurrentUser() user: IUser) {
    return { user };
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
}
