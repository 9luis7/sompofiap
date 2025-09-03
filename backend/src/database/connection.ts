import { Sequelize } from 'sequelize';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

let sequelize: Sequelize;

// Função para inicializar a conexão com o banco
export const initializeDatabase = async (): Promise<void> => {
  try {
    sequelize = new Sequelize(
      environment.database.name,
      environment.database.user,
      environment.database.password,
      {
        host: environment.database.host,
        port: environment.database.port,
        dialect: environment.database.dialect,
        ssl: environment.database.ssl,
        pool: environment.database.pool,
        logging: (sql: string, timing?: number) => {
          logger.debug(`Query executada: ${sql}`, { timing });
        },
        define: {
          timestamps: true,
          underscored: true,
          paranoid: true, // Soft deletes
          createdAt: 'created_at',
          updatedAt: 'updated_at',
          deletedAt: 'deleted_at'
        }
      }
    );

    // Testar conexão
    await sequelize.authenticate();
    logger.info('✅ Conexão com banco de dados estabelecida com sucesso');

    // Sincronizar modelos (apenas em desenvolvimento)
    if (environment.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('📊 Modelos sincronizados com o banco de dados');
    }

  } catch (error) {
    logger.error('❌ Erro ao conectar com banco de dados:', error);
    throw error;
  }
};

// Função para fechar conexão
export const closeDatabase = async (): Promise<void> => {
  try {
    if (sequelize) {
      await sequelize.close();
      logger.info('🔒 Conexão com banco de dados fechada');
    }
  } catch (error) {
    logger.error('Erro ao fechar conexão com banco:', error);
  }
};

// Getter para instância do Sequelize
export const getSequelize = (): Sequelize => {
  if (!sequelize) {
    throw new Error('Banco de dados não foi inicializado. Chame initializeDatabase() primeiro.');
  }
  return sequelize;
};

// Função para executar queries raw
export const executeQuery = async (query: string, options?: any): Promise<any> => {
  try {
    const sequelize = getSequelize();
    const result = await sequelize.query(query, options);
    return result;
  } catch (error) {
    logger.error('Erro ao executar query:', { query, error });
    throw error;
  }
};

// Função para verificar status da conexão
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    if (!sequelize) return false;
    await sequelize.authenticate();
    return true;
  } catch (error) {
    return false;
  }
};

// Exportar instância para uso em modelos
export { sequelize };
