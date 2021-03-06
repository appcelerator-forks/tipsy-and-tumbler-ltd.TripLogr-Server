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

Provider.prototype.clearDB = function(){
	db.trips.remove();
	db.waypoints.remove();
};

Provider.prototype.getAllTrips = function(cb){
	db.trips.find(function(err, docs) {
	   cb(docs);
	});
};

Provider.prototype.getTrips = function(user_id, cb){
	// similar syntax as the Mongo command-line interface
	// log each of the first ten docs in the collection
	// {user_id:user_id}
	db.trips.find({user_id:user_id}, function(err, docs) {
	  if (err) throw err;
	  if (docs && docs.length > 0) {
	  	
	  	for(var i = 0; i < docs.length; i++) {
		  	//push all the waypoitns in as a sub-object
		  	docs[i].waypoints = [];
		  	//db.waypoints.find({trip_id:{$eq:docs[i]._id}}, function(subErr, subDocs){
		  	//});
		}

		cb(docs);
	  }
	  else {
	  	cb(docs);
	  }
	});
};

Provider.prototype.insertTrip = function(userId, startLat, startLng, endLat, endLng, purpose, odoEnd, distanceKM, tripDate, tripId, cb){
	 db.trips.insert({user_id: userId, startLat:startLat, startLng: startLng, endLat: endLat, endLng: endLng, purpose: purpose, odometerEnd: odoEnd, distance: distanceKM, tripDate: tripDate, tripId: tripId },cb);
};

Provider.prototype.insertWaypoint = function(tripId, lat, lng){
	 db.trips.save({trip_id: tripId, lat:lat, lng: lng});
	 return {
	 	success: true
	 };
};

//finally,
exports.Provider = Provider;