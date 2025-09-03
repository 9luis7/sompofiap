import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/connection';

export interface IncidentAttributes {
  id?: number;
  shipment_id: number;
  incident_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: any; // GEOMETRY(POINT, 4326)
  description: string;
  reported_by: number;
  response_time_minutes?: number;
  resolution_status: 'pending' | 'investigating' | 'resolved' | 'false_alarm';
  timestamp: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface IncidentCreationAttributes extends Omit<IncidentAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Incident extends Model<IncidentAttributes, IncidentCreationAttributes> implements IncidentAttributes {
  public id!: number;
  public shipment_id!: number;
  public incident_type!: string;
  public severity!: 'low' | 'medium' | 'high' | 'critical';
  public location?: any;
  public description!: string;
  public reported_by!: number;
  public response_time_minutes?: number;
  public resolution_status!: 'pending' | 'investigating' | 'resolved' | 'false_alarm';
  public timestamp!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Incident.init(
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
    incident_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
    },
    location: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reported_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    response_time_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    resolution_status: {
      type: DataTypes.ENUM('pending', 'investigating', 'resolved', 'false_alarm'),
      allowNull: false,
      defaultValue: 'pending',
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
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Incident',
    tableName: 'incidents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
      {
        fields: ['shipment_id'],
      },
      {
        fields: ['incident_type'],
      },
      {
        fields: ['severity'],
      },
      {
        fields: ['resolution_status'],
      },
      {
        fields: ['reported_by'],
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

export default Incident;
