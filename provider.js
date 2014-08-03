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

Provider.prototype.getTrips = function(user_id, cb){
	var results = [];
	// similar syntax as the Mongo command-line interface
	// log each of the first ten docs in the collection
	db.trips.find({user_id:user_id}).limit(500).forEach(function(err, doc) {
	  if (err) throw err;
	  if (doc) { 
	  	results.push({
	  		test: 'me'
	  	});

	  	//push all the waypoitns in as a sub-object
	  	doc.waypoints = [];
	  	db.waypoints.find({trip_id:{$eq:doc.trip_id}}).forEach(function(subErr, subDoc) {
	  		doc.waypoints.push(subDoc);
	  	});

	  	//now push the document with waypoints
	  	results.push(doc);
	  }
	});

	cb(results);
};

Provider.prototype.insertTrip = function(userId, startLat, startLng, endLat, endLng, purpose, tripDate){
	 var tripId = Math.floor((Math.random() * 1000000) + 1);
	 db.trips.save({trip_id: tripId, user_id: userId, startLat:startLat, startLng: startLng, endLat: endLat, endLng: endLng, purpose: purpose, tripDate: tripDate });
	 return {
	 	success: true,
	 	trip_id: tripId
	 };
};

Provider.prototype.insertWaypoint = function(tripId, lat, lng){
	 db.trips.save({trip_id: tripId, lat:lat, lng: lng});
	 return {
	 	success: true
	 };
};

//finally,
exports.Provider = Provider;