// GetDisneyTimes.js
// Run as service or cronjob
// Function: Retrieve every rides wait times once per minute.
//
// Notes: 525,600 minutes in a year.
//========================================================================================

const dotenv = require('dotenv').config()
const Themeparks = require("themeparks");
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;

// Settings
Themeparks.Settings.Cache = __dirname + "/themeparks.db";
let startTime, DEBUG_MODE;
let timeTook = 0;
let refreshRate = 10000;
if (process.env.ENVIRONMENT == 'dev' || process.env.ENVIRONMENT == 'test') DEBUG_MODE = true;

// Parks - NOTE: Only create parks ONCE
const DisneyWorldMagicKingdom = new Themeparks.Parks.WaltDisneyWorldMagicKingdom({scheduleDaysToReturn:1});
const DisneyWorldAnimalKingdom = new Themeparks.Parks.WaltDisneyWorldAnimalKingdom({scheduleDaysToReturn:1});
const DisneyWorldEpcot = new Themeparks.Parks.WaltDisneyWorldEpcot({scheduleDaysToReturn:1});
const DisneyWorldHollywoodStudios = new Themeparks.Parks.WaltDisneyWorldHollywoodStudios({scheduleDaysToReturn:1});

class MongoDB {
	/* this.client
	   this.db
	*/
	constructor(url, dbName) {
		this.url = url;
		this.client = new MongoClient(url, { useUnifiedTopology: true });
		this.dbName = dbName;
	}	
	connect() {
		DEBUG_MODE && console.log("MongoDB connect()");
		this.client.connect((err) => {
			if (err) {
				console.log('MongoClient.connect() error: ' + err);
			}
			this.db = this.client.db(this.dbName);
		});
	}
	isConnected() {
		return !!this.client && !!this.client.topology && this.client.topology.isConnected();
	}
	insertOne(collName, row) {
		DEBUG_MODE && console.log("MongoDB insertOne()");
		this.db.collection(collName).insertOne(row, (err, res) => {
			if (err) {
				console.log('insertOne() failed for '+collName+': ' + err);
				return false;
			}
			return true;
		});
	}
}

const MainCall = () => {	
	//startTime = parseInt(moment().valueOf());
	
	if (!OurMongo.isConnected()) {
		OurMongo.connect();
	}
	 
	// Magic Kingdom
	DisneyWorldMagicKingdom.GetWaitTimes().then((rideTimes) => {
		DEBUG_MODE && console.log("--- Magic Kingdom -------------------------------------------------------");
        rideTimes.forEach((ride) => {
			OurMongo.insertOne(ride.name, {status:ride.status, waitTime:ride.waitTime});
            DEBUG_MODE && console.log(`${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
        });
    }).catch((error) => {
        console.log("Magic Kingdom GetWaitTimes() failed: " + error);
    });
	
	// Animal Kingdom
	DisneyWorldAnimalKingdom.GetWaitTimes().then((rideTimes) => {
		DEBUG_MODE && console.log("--- Animal Kingdom ------------------------------------------------------");
        rideTimes.forEach((ride) => {
			OurMongo.insertOne(ride.name, {status:ride.status, waitTime:ride.waitTime});
            DEBUG_MODE && console.log(`${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
        });
    }).catch((error) => {
        console.log("Animal Kingdom GetWaitTimes() failed: " + error);
    });
	
	// Epcot
	DisneyWorldEpcot.GetWaitTimes().then((rideTimes) => {
		DEBUG_MODE && console.log("--- Epcot ---------------------------------------------------------------");
        rideTimes.forEach((ride) => {
			OurMongo.insertOne(ride.name, {status:ride.status, waitTime:ride.waitTime});
            DEBUG_MODE && console.log(`${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
        });
    }).catch((error) => {
        console.log("Epcot GetWaitTimes() failed: " + error);
    });
	
	// Hollywood Studios
	DisneyWorldHollywoodStudios.GetWaitTimes().then((rideTimes) => {
		DEBUG_MODE && console.log("--- Hollywood Studios ---------------------------------------------------");
        rideTimes.forEach((ride) => {
			OurMongo.insertOne(ride.name, {status:ride.status, waitTime:ride.waitTime});
            DEBUG_MODE && console.log(`${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
        });
    }).catch((error) => {
        console.log("Hollywood Studios GetWaitTimes() failed: " + error);
    });
	
			
	// Below is not accurate
	//timeTook = parseInt(moment().valueOf()) - startTime;
	//console.log(timeTook + 'ms to query and insert');
}

const OurMongo = new MongoDB('mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASS+'@'+process.env.MONGO_HOST, process.env.MONGO_DBNAME);
setInterval(MainCall, refreshRate); 

