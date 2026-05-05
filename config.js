require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DEPOT_API: process.env.DEPOT_API || 'http://20.207.122.201/evaluation-service/depots',
  VEHICLE_API: process.env.VEHICLE_API || 'http://20.207.122.201/evaluation-service/vehicles',
  NOTIFICATION_API: process.env.NOTIFICATION_API || 'http://20.207.122.201/evaluation-service/notifications'
};
