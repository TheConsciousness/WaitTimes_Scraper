// GetUniversalTimes.js
// 
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


class UniversalTimes {
	constructor(MongoDBObj) {
		this.MongoDB = MongoDBObj;
	}
	
	GetUSO() {
		return new Promise((resolve,reject) => {
			if (!this.MongoDB.isConnected()) this.MongoDB.connect();
			
			UniversalStudios.GetWaitTimes().then((rideTimes) => {
				DEBUG_MODE && console.log("--- Universal Studios -------------------------------------------------------");
				rideTimes.forEach((ride) => {
					DEBUG_MODE && console.log(`USO: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
					let rideNameParsed = ride.name.replace(/[!-\/:-@[-`{-~]/g, '');
					this.MongoDB.insertOne(rideNameParsed, {status:ride.status, waitTime:ride.waitTime});
				});
				DEBUG_MODE && console.log('GetUSO() Complete');
				resolve(this);
			}).catch((error) => {
				console.log("GetUSO GetWaitTimes() failed: " + error);
				reject(this);
			});
		});
	}
	GetIOA() {
		return new Promise((resolve,reject) => {
			if (!this.MongoDB.isConnected()) this.MongoDB.connect();
			
			UniversalIslands.GetWaitTimes().then((rideTimes) => {
				DEBUG_MODE && console.log("--- Islands of Adventure ------------------------------------------");
				rideTimes.forEach((ride) => {
					DEBUG_MODE && console.log(`IOA: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
					let rideNameParsed = ride.name.replace(/[!-\/:-@[-`{-~]/g, '');
					this.MongoDB.insertOne(rideNameParsed, {status:ride.status, waitTime:ride.waitTime});
				});
				DEBUG_MODE && console.log('GetIOA() Complete');
				resolve(this);
			}).catch((error) => {
				console.log("GetIOA GetWaitTimes() failed: " + error);
				reject(this);
			});
		});
	}
	GetVB() {
		return new Promise((resolve,reject) => {
			if (!this.MongoDB.isConnected()) this.MongoDB.connect();
			
			VolcanoBay.GetWaitTimes().then((rideTimes) => {
				DEBUG_MODE && console.log("--- Volcano Bay ------------------------------------------");
				rideTimes.forEach((ride) => {
					DEBUG_MODE && console.log(`VB: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
					let rideNameParsed = ride.name.replace(/[!-\/:-@[-`{-~]/g, '');
					this.MongoDB.insertOne(rideNameParsed, {status:ride.status, waitTime:ride.waitTime});
				});
				DEBUG_MODE && console.log('GetVB() Complete');
				resolve(this);
			}).catch((error) => {
				console.log("GetVB GetWaitTimes() failed: " + error);
				reject(this);
			});
		});
	}
}

module.exports = UniversalTimes;

//const OurMongo = new MongoDB('mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASS+'@'+process.env.MONGO_HOST, process.env.MONGO_DBNAME);
//setInterval(MainCall, refreshRate); 

