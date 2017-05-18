
var express    = require('express');
var bodyParser = require('body-parser');
var PubNub = require('pubnub');

var fs = require('fs');
var app = express();

var firebase = require("firebase-admin");
var serviceAccount = require("./maslicor-dcee2a59c247.json");
// Initialize the app with a custom auth variable, limiting the server's access

// Initialize the app with a service account, granting admin privileges
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://maslicor-1bc07.firebaseio.com/"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = firebase.database();
var ref = db.ref("restricted_access/secret_document");
ref.once("value", function(snapshot) {
  console.log(snapshot.val());
});

// parse application/json
app.use(bodyParser.json({ type : '*/*' })); // force json
app.post('/locations', function(request, response){
   console.log('Headers:\n', request.headers);
   console.log('Body:\n', request.body);
    response.sendStatus(200);
    var geopoints=JSON.parse(JSON.stringify(request.body));
    console.log(geopoints[0].provider);


    var timestamp = Date.now();
    var userId    = request.headers.uid;
    var tripId    = request.headers.tid;
    var orderId   = request.headers.oid;
    var geopointId = Math.floor(Date.now() / 1000);
    writeUserData(userId, "jonathan", "jonathan@tets.com");
    writeTripData(tripId, orderId, userId, timestamp);
    writeGeoPoint(tripId, geopointId, geopoints[0].provider, geopoints[0].time , geopoints[0].latitude, geopoints[0].longitude, geopoints[0].altitude, geopoints[0].accuracy, geopoints[0].locationProvider);

});

function writeUserData(userId, name, email) {
  firebase.database().ref('users/' + userId).set({
    username       : name,
    email          : email
  });
  console.log("The userData was saved!");
}

function writeTripData(tripId, orderId, userId, timestamp) {
  firebase.database().ref('trips/' + tripId ).set({
    orderId  : orderId,
    userId   : userId,
    timestamp: timestamp
  });
    console.log("The tripData was saved!");
}

function writeGeoPoint(tripId, geopointId, provider, timestamp ,latitude, longitude, altitude, accuracy, location_provider) {
  firebase.database().ref('geopoint/' + tripId + '/' + geopointId).set({
    provider         : provider,
    timestamp        : timestamp,
    latitude         : latitude,
    longitude        : longitude,
    altitude         : altitude,
    accuracy         : accuracy,
    location_provider: location_provider
  });
  publish(latitude, longitude);
  console.log("The geoPoint was saved!");
}

function publish(lat,lng) {
   
    pubnub = new PubNub({
        publishKey : 'pub-c-56d313b2-27b0-4c59-8772-72590794c5e6',
        subscribeKey : 'sub-c-db1d172a-3a0c-11e7-b611-0619f8945a4f'
    })
       
    function publishSampleMessage() {
        var pnChannel = "map-channel";

        //console.log("Since we're "+lat+" on subscribe connectEvent, we're sure we'll receive the following publish.");
        var publishConfig = {
            channel : "map-channel",
            message : "lat:"+lat+", lng:"+lng
        }

        var publishConfig = {channel:pnChannel, message:{lat:lat, lng:lng}}

        pubnub.publish(publishConfig, function(status, response) {
            console.log(status, response);
        })
    }
       
    pubnub.addListener({
        status: function(statusEvent) {
            if (statusEvent.category === "PNConnectedCategory") {
                publishSampleMessage();
            }
        },
        message: function(message) {
            console.log("New Message!!", message);
        },
        presence: function(presenceEvent) {
            // handle presence
        }
    })      
    console.log("Subscribing..");
    pubnub.subscribe({
        channels: ['hello_world'] 
    });
};


app.listen(3000);
console.log('Server started...')
