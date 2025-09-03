import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/connection';

export interface ShipmentAttributes {
  id?: number;
  shipment_number: string;
  vehicle_id: number;
  driver_id?: number;
  origin_address: string;
  destination_address: string;
  origin_coords?: any; // GEOMETRY(POINT, 4326)
  destination_coords?: any; // GEOMETRY(POINT, 4326)
  planned_route?: any; // GEOMETRY(LINESTRING, 4326)
  actual_route?: any; // GEOMETRY(LINESTRING, 4326)
  status: 'planned' | 'in_transit' | 'completed' | 'cancelled' | 'emergency';
  cargo_type: string;
  cargo_value: number;
  estimated_departure?: Date;
  actual_departure?: Date;
  estimated_arrival?: Date;
  actual_arrival?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface ShipmentCreationAttributes extends Omit<ShipmentAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Shipment extends Model<ShipmentAttributes, ShipmentCreationAttributes> implements ShipmentAttributes {
  public id!: number;
  public shipment_number!: string;
  public vehicle_id!: number;
  public driver_id?: number;
  public origin_address!: string;
  public destination_address!: string;
  public origin_coords?: any;
  public destination_coords?: any;
  public planned_route?: any;
  public actual_route?: any;
  public status!: 'planned' | 'in_transit' | 'completed' | 'cancelled' | 'emergency';
  public cargo_type!: string;
  public cargo_value!: number;
  public estimated_departure?: Date;
  public actual_departure?: Date;
  public estimated_arrival?: Date;
  public actual_arrival?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Shipment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    shipment_number: {
      type: DataTypes.STRING(50),
      unique: true,
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
      onDelete: 'RESTRICT',
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
    origin_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    destination_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    origin_coords: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: true,
    },
    destination_coords: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: true,
    },
    planned_route: {
      type: DataTypes.GEOMETRY('LINESTRING', 4326),
      allowNull: true,
    },
    actual_route: {
      type: DataTypes.GEOMETRY('LINESTRING', 4326),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('planned', 'in_transit', 'completed', 'cancelled', 'emergency'),
      allowNull: false,
      defaultValue: 'planned',
    },
    cargo_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cargo_value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    estimated_departure: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actual_departure: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estimated_arrival: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actual_arrival: {
      type: DataTypes.DATE,
      allowNull: true,
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
    modelName: 'Shipment',
    tableName: 'shipments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
      {
        unique: true,
        fields: ['shipment_number'],
      },
      {
        fields: ['vehicle_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['cargo_type'],
      },
      {
        fields: ['estimated_departure'],
      },
      {
        fields: ['actual_departure'],
      },
      {
        fields: ['origin_coords'],
        using: 'GIST',
      },
      {
        fields: ['destination_coords'],
        using: 'GIST',
      },
      {
        fields: ['planned_route'],
        using: 'GIST',
      },
      {
        fields: ['actual_route'],
        using: 'GIST',
      },
    ],
  }
);

export default Shipment;
