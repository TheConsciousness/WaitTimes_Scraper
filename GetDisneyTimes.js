// GetDisneyTimes.js
// Run as service or cronjob
// Function: Retrieve every rides wait times once per minute.
//
// Notes: 525,600 minutes in a year.
//========================================================================================

const dotenv = require('dotenv').config()
const Themeparks = require("themeparks");
const moment = require('moment-timezone');
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
const DisneyWorldMagicKingdom = new Themeparks.Parks.WaltDisneyWorldMagicKingdom({scheduleDaysToReturn:1});
const DisneyWorldAnimalKingdom = new Themeparks.Parks.WaltDisneyWorldAnimalKingdom({scheduleDaysToReturn:1});
const DisneyWorldEpcot = new Themeparks.Parks.WaltDisneyWorldEpcot({scheduleDaysToReturn:1});
const DisneyWorldHollywoodStudios = new Themeparks.Parks.WaltDisneyWorldHollywoodStudios({scheduleDaysToReturn:1});

class DisneyTimes {
	constructor(MongoDBObj) {
		this.MongoDB = MongoDBObj;
	}
	
	GetMK() {
		return new Promise((resolve,reject) => {
			if (!this.MongoDB.isConnected()) { this.MongoDB.connect(); }
		
			DisneyWorldMagicKingdom.GetWaitTimes().then((rideTimes) => {
				DEBUG_MODE && console.log("--- Magic Kingdom -------------------------------------------------------");
				
				 rideTimes.forEach((ride) => {
					DEBUG_MODE && console.log(`MK: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
					let rideNameParsed = ride.name.replace(/[!-\/:-@[-`{-~]/g, '');
					this.MongoDB.insertOne("Rides", {name:rideNameParsed, time:moment().tz('America/Indianapolis').format(), park:'Magic Kingdom', status:ride.status, waitTime:ride.waitTime});
				});
				
				DEBUG_MODE && console.log('gotmk() complete');
				resolve(this);
			}).catch((error) => {
				console.log("Magic Kingdom GetWaitTimes() failed: " + error);
				reject(this);
			});
		});
	}
	GetAK() {
		return new Promise((resolve,reject) => {
			if (!this.MongoDB.isConnected()) this.MongoDB.connect();
			DisneyWorldAnimalKingdom.GetWaitTimes().then((rideTimes) => {
				DEBUG_MODE && console.log("--- Animal Kingdom ------------------------------------------------------");
				rideTimes.forEach((ride) => {
					DEBUG_MODE && console.log(`AK: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
					let rideNameParsed = ride.name.replace(/[!-\/:-@[-`{-~]/g, '');
					this.MongoDB.insertOne("Rides", {name:rideNameParsed, time:moment().tz('America/Indianapolis').format(), park:'Animal Kingdom', status:ride.status, waitTime:ride.waitTime});
				});
				console.log('gotak() complete');
				resolve(this);
			}).catch((error) => {
				DEBUG_MODE && console.log("Animal Kingdom GetWaitTimes() failed: " + error);
				reject(this);
			});
		
		});
	}
	GetEpcot() {
		return new Promise((resolve,reject) => {
			if (!this.MongoDB.isConnected()) this.MongoDB.connect();
			DisneyWorldEpcot.GetWaitTimes().then((rideTimes) => {
				DEBUG_MODE && console.log("--- Epcot ---------------------------------------------------------------");
				rideTimes.forEach((ride) => {
					DEBUG_MODE && console.log(`Epcot: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
					let rideNameParsed = ride.name.replace(/[!-\/:-@[-`{-~]/g, '');
					this.MongoDB.insertOne("Rides", {name:rideNameParsed, time:moment().tz('America/Indianapolis').format(), park:'Epcot', status:ride.status, waitTime:ride.waitTime});
				});
				DEBUG_MODE && console.log('gotepcot() complete');
				resolve(this);
			}).catch((error) => {
				console.log("Epcot GetWaitTimes() failed: " + error);
				reject(this);
			});
		});
	}
	GetHS() {
		if (!this.MongoDB.isConnected()) this.MongoDB.connect();
		
		return new Promise((resolve,reject) => {
			DisneyWorldHollywoodStudios.GetWaitTimes().then((rideTimes) => {
				DEBUG_MODE && console.log("--- Hollywood Studios ---------------------------------------------------");
				rideTimes.forEach((ride) => {
					DEBUG_MODE && console.log(`HS: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
					let rideNameParsed = ride.name.replace(/[!-\/:-@[-`{-~]/g, '');
					this.MongoDB.insertOne("Rides", {name:rideNameParsed, time:moment().tz('America/Indianapolis').format(), park:'Hollywood Studios', status:ride.status, waitTime:ride.waitTime});
				});
				DEBUG_MODE && console.log('getHS() complete');
				resolve(this);
			}).catch((error) => {
				console.log("Hollywood Studios GetWaitTimes() failed: " + error);
				reject(this);
			});
		});
	}
};

//const OurMongo = new MongoDB('mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASS+'@'+process.env.MONGO_HOST, process.env.MONGO_DBNAME);
//const NewDisneyTimes = new GetDisneyTimes(OurMongo);
//NewDisneyTimes.GetMK().then(() => NewDisneyTimes.GetAK().then(() => NewDisneyTimes.GetEpcot().then(() => NewDisneyTimes.GetHS().then(() => console.log("Done with everything")))));
//Promise.all([NewDisneyTimes.GetMK(), NewDisneyTimes.GetAK()]).then(() => console.log("done with all"));

module.exports = DisneyTimes;


//const OurMongo = new MongoDB('mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASS+'@'+process.env.MONGO_HOST, process.env.MONGO_DBNAME);
//setInterval(MainDisneyCall, refreshRate); 
