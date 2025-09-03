import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/connection';

export interface RiskZoneAttributes {
  id?: number;
  zone_name: string;
  zone_type: 'green' | 'yellow' | 'red';
  boundary: any; // GEOMETRY(POLYGON, 4326)
  risk_score: number;
  incident_count: number;
  last_updated?: Date;
  created_at?: Date;
}

export interface RiskZoneCreationAttributes extends Omit<RiskZoneAttributes, 'id' | 'created_at' | 'last_updated'> {}

class RiskZone extends Model<RiskZoneAttributes, RiskZoneCreationAttributes> implements RiskZoneAttributes {
  public id!: number;
  public zone_name!: string;
  public zone_type!: 'green' | 'yellow' | 'red';
  public boundary!: any;
  public risk_score!: number;
  public incident_count!: number;
  public last_updated?: Date;
  public readonly created_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RiskZone.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    zone_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    zone_type: {
      type: DataTypes.ENUM('green', 'yellow', 'red'),
      allowNull: false,
    },
    boundary: {
      type: DataTypes.GEOMETRY('POLYGON', 4326),
      allowNull: false,
    },
    risk_score: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 10,
      },
    },
    incident_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'RiskZone',
    tableName: 'risk_zones',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['zone_type'],
      },
      {
        fields: ['risk_score'],
      },
      {
        fields: ['boundary'],
        using: 'GIST',
      },
    ],
  }
);

// Hook para atualizar last_updated quando o registro é modificado
RiskZone.beforeUpdate(async (riskZone) => {
  riskZone.last_updated = new Date();
});

RiskZone.beforeCreate(async (riskZone) => {
  riskZone.last_updated = new Date();
});

export default RiskZone;
