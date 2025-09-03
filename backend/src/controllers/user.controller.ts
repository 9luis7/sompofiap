import { Request, Response, NextFunction } from 'express';

// Dados mockados realistas de usuários do sistema
const mockUsers = [
  {
    id: 1,
    username: 'admin.sompo',
    email: 'admin@sompo.com.br',
    full_name: 'Administrador Sompo',
    role: 'admin',
    is_active: true,
    last_login: new Date(Date.now() - 3600000).toISOString(),
    permissions: ['read', 'write', 'delete', 'admin'],
    department: 'Tecnologia',
    phone: '+55 11 99999-0001',
    created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    username: 'joao.silva',
    email: 'joao.silva@sompo.com.br',
    full_name: 'João Silva',
    role: 'operator',
    is_active: true,
    last_login: new Date(Date.now() - 1800000).toISOString(),
    permissions: ['read', 'write'],
    department: 'Centro de Controle',
    phone: '+55 11 99999-0002',
    current_shipments: ['SHP-2024-001', 'SHP-2024-005'],
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 3,
    username: 'maria.santos',
    email: 'maria.santos@sompo.com.br',
    full_name: 'Maria Santos',
    role: 'operator',
    is_active: true,
    last_login: new Date(Date.now() - 900000).toISOString(),
    permissions: ['read', 'write'],
    department: 'Centro de Controle',
    phone: '+55 11 99999-0003',
    current_shipments: ['SHP-2024-002'],
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    updated_at: new Date(Date.now() - 900000).toISOString()
  },
  {
    id: 4,
    username: 'carlos.oliveira',
    email: 'carlos.oliveira@sompo.com.br',
    full_name: 'Carlos Oliveira',
    role: 'operator',
    is_active: true,
    last_login: new Date(Date.now() - 7200000).toISOString(),
    permissions: ['read', 'write'],
    department: 'Centro de Controle',
    phone: '+55 11 99999-0004',
    current_shipments: ['SHP-2024-003'],
    created_at: new Date(Date.now() - 86400000 * 120).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 5,
    username: 'ana.pereira',
    email: 'ana.pereira@sompo.com.br',
    full_name: 'Ana Pereira',
    role: 'operator',
    is_active: true,
    last_login: new Date(Date.now() - 2400000).toISOString(),
    permissions: ['read', 'write'],
    department: 'Centro de Controle',
    phone: '+55 21 99999-0005',
    current_shipments: ['SHP-2024-004'],
    created_at: new Date(Date.now() - 86400000 * 75).toISOString(),
    updated_at: new Date(Date.now() - 2400000).toISOString()
  },
  {
    id: 6,
    username: 'cliente.techcom',
    email: 'cliente@techcom.com.br',
    full_name: 'Cliente TechCom',
    role: 'client',
    is_active: true,
    last_login: new Date(Date.now() - 86400000).toISOString(),
    permissions: ['read'],
    department: 'Cliente',
    phone: '+55 11 88888-0001',
    company: 'TechCom Distribuidora Ltda',
    shipments_history: ['SHP-2024-001'],
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 7,
    username: 'cliente.farma',
    email: 'cliente@farma.com.br',
    full_name: 'Cliente FarmaBrasil',
    role: 'client',
    is_active: true,
    last_login: new Date(Date.now() - 43200000).toISOString(),
    permissions: ['read'],
    department: 'Cliente',
    phone: '+55 31 88888-0002',
    company: 'FarmaBrasil S.A.',
    shipments_history: ['SHP-2024-002'],
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString()
  }
];

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

      // Em um sistema real, isso seria atualizado no banco
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
