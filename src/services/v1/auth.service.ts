import { NotFoundError, UnauthorizedError } from 'routing-controllers';

import { TokenTypes } from '@common/constants';
import Tokens from '@models/tokens.model';
import { TokenService, UserService } from '@services/v1';
import SetPasswordDto from '@v1/auth/dtos/setPassword.dto';

export class AuthService {
  private readonly tokenModel = Tokens;
  private readonly userService = new UserService();
  private readonly tokenService = new TokenService();

  async loginUserWithEmailAndPassword(email: string, password: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user || !(await this.userService.comparePassword(password, user.password))) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return user;
  }

  async setPassword(data: SetPasswordDto) {
    const { email, newPassword, otp, accessToken } = data;
    console.log("Setting password for email:", data);
    console.log("OTP provided:", otp);

    const accessTokenDoc = await this.tokenService.verifyToken(accessToken, TokenTypes.ACCESS);

    if (!accessTokenDoc) {
      throw new UnauthorizedError('Invalid or expired access token');
    }
    const user = await this.loginUserWithEmailAndPassword(email, otp);
    if (!user) {
      throw new NotFoundError('User not found');
    }


    const response = await this.userService.updateById(user.id, { password: newPassword, isInitialPasswordUpdated: true });
    await this.tokenModel.deleteMany({ userId: user.id, type: TokenTypes.ACCESS });
    console.log("Password updated for user:", response);
    return response;
  }

  async logout(refreshToken: string) {
    const token = await this.tokenModel.findOne({ token: refreshToken, type: TokenTypes.REFRESH, blacklisted: false });

    if (!token) {
      throw new NotFoundError('Not Found');
    }

    await token.deleteOne();
  }

  async refreshAuth(refreshToken: string) {
    try {
      const refreshTokenDoc = await this.tokenService.verifyToken(refreshToken, TokenTypes.REFRESH);
      const user = await this.userService.getById(refreshTokenDoc.userId);
      if (!user) {
        throw new Error();
      }

      await refreshTokenDoc.deleteOne();
      const tokens = await this.tokenService.generateAuthTokens(user);
      return { user, tokens };
    } catch (error) {
      if ((error as Error).message === 'Token not found' || (error as Error).message === 'jwt expired') {
        throw new UnauthorizedError('Token not found');
      }
      throw new UnauthorizedError('Please authenticate');
    }
  }

  async resetPassword(token: string, password: string) {
    try {
      const tokenDoc = await this.tokenService.verifyToken(token, TokenTypes.RESET_PASSWORD);
      const user = await this.userService.getById(tokenDoc.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      await this.userService.updateById(user.id, { password });
      await this.tokenModel.deleteMany({ userId: user.id });
    } catch (error) {
      if ((error as Error).message === 'Token not found' || (error as Error).message === 'jwt expired') {
        throw new UnauthorizedError('Token not found');
      }
      throw error;
    }
  }
}
