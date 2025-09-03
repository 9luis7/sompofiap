import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/connection';

export interface UserAttributes {
  id?: number;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'operator' | 'client';
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'created_at' | 'updated_at'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password_hash!: string;
  public full_name!: string;
  public role!: 'admin' | 'operator' | 'client';
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'operator', 'client'),
      allowNull: false,
      defaultValue: 'client',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true, // Soft deletes
    deletedAt: 'deleted_at',
    indexes: [
      {
        unique: true,
        fields: ['username'],
      },
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['role'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

// Hooks para hash de senha (será implementado quando instalar bcryptjs)
User.beforeCreate(async (user) => {
  // TODO: Implementar hash de senha
  // user.password_hash = await bcrypt.hash(user.password_hash, environment.security.bcryptRounds);
});

User.beforeUpdate(async (user) => {
  // TODO: Implementar hash de senha se foi alterada
  // if (user.changed('password_hash')) {
  //   user.password_hash = await bcrypt.hash(user.password_hash, environment.security.bcryptRounds);
  // }
});

export default User;
