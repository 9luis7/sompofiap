import { Request, Response, NextFunction } from 'express';

// TODO: Substituir por dados reais do banco de dados
const mockUsers: any[] = [];

export const userController = {
  getAllUsers: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = '1', limit = '10', role, isActive } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      let filteredUsers = mockUsers;

      // Aplicar filtros
      if (role) {
        filteredUsers = filteredUsers.filter(u => u.role === role);
      }

      if (isActive !== undefined) {
        const activeFilter = isActive === 'true';
        filteredUsers = filteredUsers.filter(u => u.is_active === activeFilter);
      }

      // Paginação
      const paginatedUsers = filteredUsers.slice(offset, offset + limitNum);

      // Remover senha dos resultados
      const usersWithoutPassword = paginatedUsers.map(user => {
        const { ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json({
        success: true,
        data: {
          users: usersWithoutPassword,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: filteredUsers.length,
            pages: Math.ceil(filteredUsers.length / limitNum)
          },
          summary: {
            total_users: mockUsers.length,
            active_users: mockUsers.filter(u => u.is_active).length,
            inactive_users: mockUsers.filter(u => !u.is_active).length,
            admins: mockUsers.filter(u => u.role === 'admin').length,
            operators: mockUsers.filter(u => u.role === 'operator').length,
            clients: mockUsers.filter(u => u.role === 'client').length
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getUserById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);

      const user = mockUsers.find(u => u.id === userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      // Remover senha do resultado
      const { ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: { user: userWithoutPassword }
      });
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);

      const user = mockUsers.find(u => u.id === userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      // TODO: Atualizar no banco de dados
      const updatedUser = {
        ...user,
        ...req.body,
        updated_at: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  }
};
