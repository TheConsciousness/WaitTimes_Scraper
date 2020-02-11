// GetUniversalTimes.js
// Run as service or cronjob
// Function: Retrieve every rides wait times once per minute.
//
// Universal Studios Florida
//========================================================================================

const dotenv = require('dotenv').config()
const Themeparks = require("themeparks");
const moment = require('moment');
const MongoDB = require('./MongoDB.js')

// Settings
Themeparks.Settings.Cache = __dirname + "/themeparks.db";
let DEBUG_MODE;
let timeTook = 0;
let refreshRate = 10000;

// Environment Variables
if (!process.env.ENVIRONMENT) { console.log("No ENV file, quitting."); process.exit(); }
if (process.env.ENVIRONMENT == 'dev' || process.env.ENVIRONMENT == 'test') DEBUG_MODE = true; 

// Parks - NOTE: Only create parks ONCE
const UniversalStudios = new Themeparks.Parks.UniversalStudiosFlorida({scheduleDaysToReturn:1});
const UniversalIslands = new Themeparks.Parks.UniversalIslandsOfAdventure({scheduleDaysToReturn:1});
const VolcanoBay = new Themeparks.Parks.UniversalVolcanoBay({scheduleDaysToReturn:1});

// Our main function
const MainCall = () => {	

	if (!OurMongo.isConnected()) {
		OurMongo.connect();
	}
	 
	// Universal Studios
	UniversalStudios.GetWaitTimes().then((rideTimes) => {
		DEBUG_MODE && console.log("--- Universal Studios -------------------------------------------------------");
        rideTimes.forEach((ride) => {
            DEBUG_MODE && console.log(`USO: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
			
			let rideNameParsed = ride.name.replace(/[™℠®']/g, '');
			OurMongo.insertOne(rideNameParsed, {status:ride.status, waitTime:ride.waitTime});
        });
    }).catch((error) => {
		
        console.log("Universal Studios GetWaitTimes() failed: " + error);
    });
	
	// Universal Islands
	UniversalIslands.GetWaitTimes().then((rideTimes) => {
		DEBUG_MODE && console.log("--- Universal Islands ------------------------------------------------------");
        rideTimes.forEach((ride) => {
            DEBUG_MODE && console.log(`IOA: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
			
			let rideNameParsed = ride.name.replace(/[™℠®']/g, '');
			OurMongo.insertOne(rideNameParsed, {status:ride.status, waitTime:ride.waitTime});
        });
    }).catch((error) => {
        console.log("Universal Islands GetWaitTimes() failed: " + error);
    });
	
	// Volcano Bay
	VolcanoBay.GetWaitTimes().then((rideTimes) => {
		DEBUG_MODE && console.log("--- Volcano Bay ---------------------------------------------------------------");
        rideTimes.forEach((ride) => {
            DEBUG_MODE && console.log(`VB: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
			
			let rideNameParsed = ride.name.replace(/[™℠®']/g, '');
			OurMongo.insertOne(rideNameParsed, {status:ride.status, waitTime:ride.waitTime});
        });
    }).catch((error) => {
        console.log("Volcano Bay GetWaitTimes() failed: " + error);
    });
}

const OurMongo = new MongoDB('mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASS+'@'+process.env.MONGO_HOST, process.env.MONGO_DBNAME);
setInterval(MainCall, refreshRate); 

