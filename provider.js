/*
 *
//MongoDB connection information from OpenShift 
var mongoUser = 'admin';
var mongoPass = 'TKWna_bFsyaF';
var dbName    = 'triplogr';
var host    = 'mongodb://$OPENSHIFT_MONGODB_DB_HOST:$OPENSHIFT_MONGODB_DB_PORT/';
*/


// default to a 'localhost' configuration:
var connection_string = '127.0.0.1:27017/triplogr';

// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

var db, trips, waypoints;
var mongojs = require('mongojs');


Provider = function(host, port) {
    db = mongojs(connection_string, ['trips', 'waypoints']);
	trips = db.collection('trips');
	waypoints = db.collection('waypoints');
};

Provider.prototype.getTrips = function(){
	// similar syntax as the Mongo command-line interface
	// log each of the first ten docs in the collection
	var data = db.trips.find({}).limit(500);
	return data;
};

Provider.prototype.insertTrip = function(startLat, startLng, endLat, endLng, purpose, tripDate){
	 db.trips.save({ startLat:startLat, startLng: startLng, endLat: endLat, endLng: endLng, purpose: purpose, tripDate: tripDate });
	 return true;
};

//finally,
exports.Provider = Provider;