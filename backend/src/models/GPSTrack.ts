import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/connection';

export interface GPSTrackAttributes {
  id?: number;
  shipment_id: number;
  vehicle_id: number;
  location: any; // GEOMETRY(POINT, 4326)
  speed_kmh: number;
  direction: number;
  accuracy_meters: number;
  timestamp: Date;
  created_at?: Date;
}

export interface GPSTrackCreationAttributes extends Omit<GPSTrackAttributes, 'id' | 'created_at'> {}

class GPSTrack extends Model<GPSTrackAttributes, GPSTrackCreationAttributes> implements GPSTrackAttributes {
  public id!: number;
  public shipment_id!: number;
  public vehicle_id!: number;
  public location!: any;
  public speed_kmh!: number;
  public direction!: number;
  public accuracy_meters!: number;
  public timestamp!: Date;
  public readonly created_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GPSTrack.init(
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
    location: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: false,
    },
    speed_kmh: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
    },
    direction: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    accuracy_meters: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
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
    modelName: 'GPSTrack',
    tableName: 'gps_tracks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // Não precisamos de updated_at pois os registros são imutáveis
    indexes: [
      {
        fields: ['shipment_id'],
      },
      {
        fields: ['vehicle_id'],
      },
      {
        fields: ['location'],
        using: 'GIST',
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['shipment_id', 'timestamp'],
      },
    ],
  }
);

export default GPSTrack;
