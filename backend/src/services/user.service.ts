import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User, UserAttributes, UserCreationAttributes } from '../models';
import { environment } from '../config/environment';
import { logInfo, logError } from '../utils/logger';
import { AppError } from '../middleware/error.middleware';

export class UserService {
  // Criar novo usuário
  static async createUser(userData: UserCreationAttributes): Promise<User> {
    try {
      // Verificar se usuário já existe
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { username: userData.username },
            { email: userData.email }
          ]
        }
      });

      if (existingUser) {
        throw new AppError('Usuário já existe com este username ou email', 409);
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.password_hash, environment.security.bcryptRounds);

      // Criar usuário
      const user = await User.create({
        ...userData,
        password_hash: hashedPassword,
      });

      logInfo('Novo usuário criado', { userId: user.id, username: user.username });

      return user;
    } catch (error) {
      logError('Erro ao criar usuário', error as Error);
      throw error;
    }
  }

  // Buscar usuário por ID
  static async getUserById(id: number): Promise<User | null> {
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password_hash'] } // Não retornar senha
      });

      return user;
    } catch (error) {
      logError('Erro ao buscar usuário por ID', error as Error);
      throw error;
    }
  }

  // Buscar usuário por username
  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: { username },
      });

      return user;
    } catch (error) {
      logError('Erro ao buscar usuário por username', error as Error);
      throw error;
    }
  }

  // Buscar todos os usuários (com paginação)
  static async getAllUsers(options: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
  } = {}): Promise<{ users: User[]; total: number; pages: number }> {
    try {
      const { page = 1, limit = 10, role, isActive } = options;
      const offset = (page - 1) * limit;

      const whereClause: any = {};

      if (role) {
        whereClause.role = role;
      }

      if (isActive !== undefined) {
        whereClause.is_active = isActive;
      }

      const { rows: users, count: total } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password_hash'] },
        limit,
        offset,
        order: [['created_at', 'DESC']],
      });

      const pages = Math.ceil(total / limit);

      return { users, total, pages };
    } catch (error) {
      logError('Erro ao buscar usuários', error as Error);
      throw error;
    }
  }

  // Atualizar usuário
  static async updateUser(id: number, updateData: Partial<UserAttributes>): Promise<User> {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Se estiver atualizando senha, fazer hash
      if (updateData.password_hash) {
        updateData.password_hash = await bcrypt.hash(updateData.password_hash, environment.security.bcryptRounds);
      }

      await user.update(updateData);

      logInfo('Usuário atualizado', { userId: id });

      return user;
    } catch (error) {
      logError('Erro ao atualizar usuário', error as Error);
      throw error;
    }
  }

  // Deletar usuário (soft delete)
  static async deleteUser(id: number): Promise<void> {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      await user.destroy();

      logInfo('Usuário deletado', { userId: id });
    } catch (error) {
      logError('Erro ao deletar usuário', error as Error);
      throw error;
    }
  }

  // Verificar senha
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      logError('Erro ao verificar senha', error as Error);
      return false;
    }
  }

  // Alterar senha
  static async changePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password_hash);

      if (!isCurrentPasswordValid) {
        throw new AppError('Senha atual incorreta', 400);
      }

      // Hash da nova senha
      const hashedNewPassword = await bcrypt.hash(newPassword, environment.security.bcryptRounds);

      // Atualizar senha
      await user.update({ password_hash: hashedNewPassword });

      logInfo('Senha alterada', { userId: id });
    } catch (error) {
      logError('Erro ao alterar senha', error as Error);
      throw error;
    }
  }
}
