import { User } from '../models';
import { UserService } from './user.service';
import { generateTokens, verifyRefreshToken } from '../middleware/auth.middleware';
import { logInfo, logError } from '../utils/logger';
import { AppError } from '../middleware/error.middleware';

export class AuthService {
  // Login de usuário
  static async login(username: string, password: string): Promise<{
    user: User;
    token: string;
    refreshToken: string;
  }> {
    try {
      // Buscar usuário
      const user = await User.findOne({
        where: { username }
      });

      if (!user || !user.is_active) {
        throw new AppError('Credenciais inválidas', 401);
      }

      // Verificar senha
      const isPasswordValid = await UserService.verifyPassword(password, user.password_hash);

      if (!isPasswordValid) {
        throw new AppError('Credenciais inválidas', 401);
      }

      // Gerar tokens
      const tokens = generateTokens({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      logInfo('Login realizado com sucesso', { userId: user.id, username: user.username });

      return {
        user,
        token: tokens.token,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      logError('Erro no login', error as Error);
      throw error;
    }
  }

  // Registro de novo usuário
  static async register(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role: 'admin' | 'operator' | 'client';
  }): Promise<User> {
    try {
      // Criar usuário usando UserService
      const user = await UserService.createUser({
        username: userData.username,
        email: userData.email,
        password_hash: userData.password, // Será hasheada no UserService
        full_name: userData.fullName,
        role: userData.role,
        is_active: true,
      });

      return user;
    } catch (error) {
      logError('Erro no registro', error as Error);
      throw error;
    }
  }

  // Refresh token
  static async refreshToken(refreshToken: string): Promise<{
    token: string;
    refreshToken: string;
  }> {
    try {
      // Verificar refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Buscar usuário
      const user = await User.findByPk(decoded.userId);

      if (!user || !user.is_active) {
        throw new AppError('Usuário não encontrado ou inativo', 404);
      }

      // Gerar novos tokens
      const tokens = generateTokens({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      logInfo('Token renovado', { userId: user.id });

      return tokens;
    } catch (error) {
      logError('Erro ao renovar token', error as Error);
      throw error;
    }
  }

  // Logout (invalidar refresh token se necessário)
  static async logout(userId: number): Promise<void> {
    try {
      // TODO: Implementar invalidação de refresh token no banco/cache
      logInfo('Logout realizado', { userId });
    } catch (error) {
      logError('Erro no logout', error as Error);
      throw error;
    }
  }

  // Obter perfil do usuário
  static async getProfile(userId: number): Promise<User> {
    try {
      const user = await UserService.getUserById(userId);

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      return user;
    } catch (error) {
      logError('Erro ao obter perfil', error as Error);
      throw error;
    }
  }

  // Atualizar perfil
  static async updateProfile(
    userId: number,
    updateData: {
      fullName?: string;
      email?: string;
    }
  ): Promise<User> {
    try {
      const user = await UserService.updateUser(userId, {
        full_name: updateData.fullName,
        email: updateData.email,
      });

      return user;
    } catch (error) {
      logError('Erro ao atualizar perfil', error as Error);
      throw error;
    }
  }

  // Verificar se usuário tem permissão para uma ação
  static checkPermission(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole);
  }
}
