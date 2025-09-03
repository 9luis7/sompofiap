import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/connection';

export interface DriverAttributes {
  id?: number;
  full_name: string;
  cpf: string;
  cnh_number: string;
  cnh_category: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface DriverCreationAttributes
  extends Omit<DriverAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Driver extends Model<DriverAttributes, DriverCreationAttributes> implements DriverAttributes {
  public id!: number;
  public full_name!: string;
  public cpf!: string;
  public cnh_number!: string;
  public cnh_category!: string;
  public phone?: string;
  public email?: string;
  public address?: string;
  public emergency_contact?: string;
  public emergency_phone?: string;
  public is_active!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Driver.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING(14),
      unique: true,
      allowNull: false,
      validate: {
        is: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, // Formato CPF: XXX.XXX.XXX-XX
      },
    },
    cnh_number: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
    },
    cnh_category: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    emergency_contact: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    emergency_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
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
    modelName: 'Driver',
    tableName: 'drivers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
      {
        unique: true,
        fields: ['cpf'],
      },
      {
        unique: true,
        fields: ['cnh_number'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['full_name'],
      },
    ],
  }
);

export default Driver;
