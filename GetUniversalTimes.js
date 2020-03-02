// GetUniversalTimes.js
// 
// Function: Retrieve every rides wait times once per minute.
//
// Universal Studios Florida
//========================================================================================

const dotenv = require('dotenv').config();
const Themeparks = require("themeparks");
const moment = require('moment-timezone');
const MongoDB = require('./MongoDB.js');
const winston = require('winston');

// Logging
const loggerOptions = {
  file: {
	level: 'debug',
    filename: `./index.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 2,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  }
};
const logger = winston.createLogger({transports: [new winston.transports.File(loggerOptions.file), new winston.transports.Console(loggerOptions.console)], exitOnError: false});

// Settings
Themeparks.Settings.Cache = __dirname + "/themeparks.db";
let DEBUG_MODE = false;

// Environment Variables
if (!process.env.ENVIRONMENT) { logger.error("No ENV file, quitting."); process.exit(); }
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
					DEBUG_MODE && logger.debug("--- Universal Studios -------------------------------------------------------");
					rideTimes.forEach((ride) => {
						DEBUG_MODE && logger.info(`USO: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
						let rideNameParsed = ride.name.replace(/[!-\/:-@[-`{-~]/g, '');
						this.MongoDB.insertOne("Rides", {name:rideNameParsed, time:moment().tz('America/Indiana/Indianapolis').format(), park:'Universal Studios', status:ride.status, waitTime:ride.waitTime});
					});
					DEBUG_MODE && logger.debug('GetUSO() Complete');
					resolve(this);
				}).catch((error) => {logger.error(`[${moment().format("MM-DD-YYYY HH:mm:ss")}] GetUSO() failed.`); reject(); });
		});
	}
	GetIOA() {
		return new Promise((resolve,reject) => {
			if (!this.MongoDB.isConnected()) this.MongoDB.connect();
			
			UniversalIslands.GetWaitTimes().then((rideTimes) => {
				DEBUG_MODE && logger.debug("--- Islands of Adventure ------------------------------------------");
				rideTimes.forEach((ride) => {
					DEBUG_MODE && logger.info(`IOA: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
					let rideNameParsed = ride.name.replace(/[!-\/:-@[-`{-~]/g, '');
					this.MongoDB.insertOne("Rides", {name:rideNameParsed, time:moment().tz('America/Indiana/Indianapolis').format(), park:'Islands Of Adventure', status:ride.status, waitTime:ride.waitTime});
				});
				DEBUG_MODE && logger.debug('GetIOA() Complete');
				resolve(this);
			}).catch((error) => {logger.error(`[${moment().format("MM-DD-YYYY HH:mm:ss")}] GetIOA() failed.`); reject(); });
		});
	}
	GetVB() {
		return new Promise((resolve,reject) => {
			if (!this.MongoDB.isConnected()) this.MongoDB.connect();
			
			VolcanoBay.GetWaitTimes().then((rideTimes) => {
					DEBUG_MODE && logger.debug("--- Volcano Bay ------------------------------------------");
					rideTimes.forEach((ride) => {
						DEBUG_MODE && logger.info(`VB: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
						let rideNameParsed = ride.name.replace(/[!-\/:-@[-`{-~]/g, '');
						this.MongoDB.insertOne("Rides", {name:rideNameParsed, time:moment().tz('America/Indiana/Indianapolis').format(), park:'Volcano Bay', status:ride.status, waitTime:ride.waitTime});
					});
					DEBUG_MODE && logger.debug('GetVB() Complete');
					resolve(this);
			}).catch((error) => {logger.error(`[${moment().format("MM-DD-YYYY HH:mm:ss")}] GetVB() failed.`); reject(); });
		});
	}
}

module.exports = UniversalTimes;
