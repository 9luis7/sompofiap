import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/connection';

export interface VehicleAttributes {
  id?: number;
  license_plate: string;
  vehicle_type: string;
  capacity_kg: number;
  owner_company: string;
  iot_device_id: string;
  driver_id?: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface VehicleCreationAttributes extends Omit<VehicleAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
  public id!: number;
  public license_plate!: string;
  public vehicle_type!: string;
  public capacity_kg!: number;
  public owner_company!: string;
  public iot_device_id!: string;
  public driver_id?: number;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Vehicle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    license_plate: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
    },
    vehicle_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    capacity_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    owner_company: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    iot_device_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'drivers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
    modelName: 'Vehicle',
    tableName: 'vehicles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
      {
        unique: true,
        fields: ['license_plate'],
      },
      {
        fields: ['vehicle_type'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['iot_device_id'],
      },
    ],
  }
);

export default Vehicle;
