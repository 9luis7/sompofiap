import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/connection';

export interface AlertAttributes {
  id?: number;
  shipment_id: number;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location?: any; // GEOMETRY(POINT, 4326)
  is_acknowledged: boolean;
  acknowledged_by?: number;
  acknowledged_at?: Date;
  timestamp: Date;
  created_at?: Date;
}

export interface AlertCreationAttributes extends Omit<AlertAttributes, 'id' | 'created_at'> {}

class Alert extends Model<AlertAttributes, AlertCreationAttributes> implements AlertAttributes {
  public id!: number;
  public shipment_id!: number;
  public alert_type!: string;
  public severity!: 'low' | 'medium' | 'high' | 'critical';
  public message!: string;
  public location?: any;
  public is_acknowledged!: boolean;
  public acknowledged_by?: number;
  public acknowledged_at?: Date;
  public timestamp!: Date;
  public readonly created_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Alert.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    shipment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'shipments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    alert_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: true,
    },
    is_acknowledged: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    acknowledged_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    acknowledged_at: {
      type: DataTypes.DATE,
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
    modelName: 'Alert',
    tableName: 'alerts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // Registros são imutáveis após criação
    indexes: [
      {
        fields: ['shipment_id'],
      },
      {
        fields: ['alert_type'],
      },
      {
        fields: ['severity'],
      },
      {
        fields: ['is_acknowledged'],
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['location'],
        using: 'GIST',
      },
    ],
  }
);

export default Alert;
