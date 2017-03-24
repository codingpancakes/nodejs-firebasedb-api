
var express    = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();




var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("./maslicor-dcee2a59c247.json");

// Initialize the app with a custom auth variable, limiting the server's access




// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://maslicor-1bc07.firebaseio.com/"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref("restricted_access/secret_document");
ref.once("value", function(snapshot) {
  console.log(snapshot.val());
});






// parse application/json
app.use(bodyParser.json({ type : '*/*' })); // force json

app.post('/locations', function(request, response){
    str = JSON.stringify(request.body);

    console.log('Headers:\n', request.headers);
    console.log('Body:\n', request.body);
    console.log('------------------------------');
    response.sendStatus(200);
    var userId = Math.floor(Date.now() / 1000);
    var usersRef = ref.child("users"+ userId);
    usersRef.set(str);




        	fs.writeFile("test.txt", str, function(err){
    	  	if(err) {
            		return console.log(err);
        		}
        		console.log("The file was saved!");

    	});
    });

app.listen(3000);
console.log('Server started...')
