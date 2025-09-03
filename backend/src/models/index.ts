// Importar todos os modelos
import User from './User';
import Driver from './Driver';
import Vehicle from './Vehicle';
import Shipment from './Shipment';
import RiskZone from './RiskZone';
import GPSTrack from './GPSTrack';
import Incident from './Incident';
import SensorData from './SensorData';
import Alert from './Alert';

// Definir relacionamentos

// Driver -> Vehicle (one-to-many)
Driver.hasMany(Vehicle, {
  foreignKey: 'driver_id',
  as: 'vehicles',
});

Vehicle.belongsTo(Driver, {
  foreignKey: 'driver_id',
  as: 'driver',
});

// Driver -> Shipment (one-to-many)
Driver.hasMany(Shipment, {
  foreignKey: 'driver_id',
  as: 'shipments',
});

Shipment.belongsTo(Driver, {
  foreignKey: 'driver_id',
  as: 'driver',
});

// User -> Incident (reported_by)
User.hasMany(Incident, {
  foreignKey: 'reported_by',
  as: 'reportedIncidents',
});

Incident.belongsTo(User, {
  foreignKey: 'reported_by',
  as: 'reportedBy',
});

// User -> Alert (acknowledged_by)
User.hasMany(Alert, {
  foreignKey: 'acknowledged_by',
  as: 'acknowledgedAlerts',
});

Alert.belongsTo(User, {
  foreignKey: 'acknowledged_by',
  as: 'acknowledgedBy',
});

// Vehicle -> Shipment
Vehicle.hasMany(Shipment, {
  foreignKey: 'vehicle_id',
  as: 'shipments',
});

Shipment.belongsTo(Vehicle, {
  foreignKey: 'vehicle_id',
  as: 'vehicle',
});

// Vehicle -> GPSTrack
Vehicle.hasMany(GPSTrack, {
  foreignKey: 'vehicle_id',
  as: 'gpsTracks',
});

GPSTrack.belongsTo(Vehicle, {
  foreignKey: 'vehicle_id',
  as: 'vehicle',
});

// Vehicle -> SensorData
Vehicle.hasMany(SensorData, {
  foreignKey: 'vehicle_id',
  as: 'sensorData',
});

SensorData.belongsTo(Vehicle, {
  foreignKey: 'vehicle_id',
  as: 'vehicle',
});

// Shipment -> GPSTrack
Shipment.hasMany(GPSTrack, {
  foreignKey: 'shipment_id',
  as: 'gpsTracks',
});

GPSTrack.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment',
});

// Shipment -> Incident
Shipment.hasMany(Incident, {
  foreignKey: 'shipment_id',
  as: 'incidents',
});

Incident.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment',
});

// Shipment -> SensorData
Shipment.hasMany(SensorData, {
  foreignKey: 'shipment_id',
  as: 'sensorData',
});

SensorData.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment',
});

// Shipment -> Alert
Shipment.hasMany(Alert, {
  foreignKey: 'shipment_id',
  as: 'alerts',
});

Alert.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment',
});

// Exportar todos os modelos
export {
  User,
  Driver,
  Vehicle,
  Shipment,
  RiskZone,
  GPSTrack,
  Incident,
  SensorData,
  Alert,
};

// Tipos para uso em outros arquivos
export type {
  UserAttributes,
  UserCreationAttributes,
} from './User';

export type {
  DriverAttributes,
  DriverCreationAttributes,
} from './Driver';

export type {
  VehicleAttributes,
  VehicleCreationAttributes,
} from './Vehicle';

export type {
  ShipmentAttributes,
  ShipmentCreationAttributes,
} from './Shipment';

export type {
  RiskZoneAttributes,
  RiskZoneCreationAttributes,
} from './RiskZone';

export type {
  GPSTrackAttributes,
  GPSTrackCreationAttributes,
} from './GPSTrack';

export type {
  IncidentAttributes,
  IncidentCreationAttributes,
} from './Incident';

export type {
  SensorDataAttributes,
  SensorDataCreationAttributes,
} from './SensorData';

export type {
  AlertAttributes,
  AlertCreationAttributes,
} from './Alert';
