import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/connection';

export interface SensorDataAttributes {
  id?: number;
  vehicle_id: number;
  shipment_id?: number;
  sensor_type: string;
  sensor_value: number;
  unit: string;
  location?: any; // GEOMETRY(POINT, 4326)
  timestamp: Date;
  created_at?: Date;
}

export interface SensorDataCreationAttributes extends Omit<SensorDataAttributes, 'id' | 'created_at'> {}

class SensorData extends Model<SensorDataAttributes, SensorDataCreationAttributes> implements SensorDataAttributes {
  public id!: number;
  public vehicle_id!: number;
  public shipment_id?: number;
  public sensor_type!: string;
  public sensor_value!: number;
  public unit!: string;
  public location?: any;
  public timestamp!: Date;
  public readonly created_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SensorData.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vehicles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    shipment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'shipments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    sensor_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    sensor_value: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    location: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'SensorData',
    tableName: 'sensors_data',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // Registros são imutáveis
    indexes: [
      {
        fields: ['vehicle_id'],
      },
      {
        fields: ['shipment_id'],
      },
      {
        fields: ['sensor_type'],
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['location'],
        using: 'GIST',
      },
      {
        fields: ['vehicle_id', 'timestamp'],
      },
      {
        fields: ['shipment_id', 'timestamp'],
      },
    ],
  }
);

export default SensorData;
