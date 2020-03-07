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
		
			try {
				DisneyWorldMagicKingdom.GetWaitTimes().then((rideTimes) => {
					DEBUG_MODE && logger.debug("--- Magic Kingdom -------------------------------------------------------");
					
					 rideTimes.forEach((ride) => {
						DEBUG_MODE && logger.debug(`MK: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
						let rideNameParsed = ride.name.replace(/[!-\/:-@[-`{-~]/g, '');
						this.MongoDB.insertOne("Rides", {name:rideNameParsed, time:new Date(), park:'Magic Kingdom', status:ride.status, waitTime:ride.waitTime});
					});
					
					DEBUG_MODE && logger.debug('GetMK() complete');
					resolve(this);
				})
			}
			catch (error) {
				logger.error("Magic Kingdom GetWaitTimes() failed: "+error);
				reject(this);
			}
		});
	}
	GetAK() {
		return new Promise((resolve,reject) => {
			if (!this.MongoDB.isConnected()) this.MongoDB.connect();
			
			try {
				DisneyWorldAnimalKingdom.GetWaitTimes().then((rideTimes) => {
				DEBUG_MODE && logger.debug("--- Animal Kingdom ------------------------------------------------------");
				rideTimes.forEach((ride) => {
					DEBUG_MODE && logger.debug(`AK: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
					let rideNameParsed = ride.name.replace(/[!-\/:-@[-`{-~]/g, '');
					this.MongoDB.insertOne("Rides", {name:rideNameParsed, time:new Date(), park:'Animal Kingdom', status:ride.status, waitTime:ride.waitTime});
				});
				DEBUG_MODE && logger.debug('GetAK() complete');
				resolve(this);
				})
			}
			catch (error) {
				logger.error("Animal Kingdom GetWaitTimes() failed: "+error);
				reject(this);
			}
		});
	}
	GetEpcot() {
		return new Promise((resolve,reject) => {
			if (!this.MongoDB.isConnected()) this.MongoDB.connect();
			
			try {
				DisneyWorldEpcot.GetWaitTimes().then((rideTimes) => {
				DEBUG_MODE && logger.debug("--- Epcot ---------------------------------------------------------------");
				rideTimes.forEach((ride) => {
					DEBUG_MODE && logger.debug(`Epcot: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
					let rideNameParsed = ride.name.replace(/[!-\/:-@[-`{-~]/g, '');
					this.MongoDB.insertOne("Rides", {name:rideNameParsed, time:new Date(), park:'Epcot', status:ride.status, waitTime:ride.waitTime});
				});
				DEBUG_MODE && logger.debug('GetEpcot() complete');
				resolve(this);
				})
			}
			catch (error) {
				logger.error("Epcot GetWaitTimes() failed: "+error);
				reject(this);
			}
		});
	}
	GetHS() {
		return new Promise((resolve,reject) => {
			if (!this.MongoDB.isConnected()) { this.MongoDB.connect(); }
		
			try {
				DisneyWorldMagicKingdom.GetWaitTimes().then((rideTimes) => {
					DEBUG_MODE && logger.debug("--- Hollywood Studios ----------------------------------------------------");
					
					 rideTimes.forEach((ride) => {
						DEBUG_MODE && logger.debug(`HS: ${ride.name}: ${ride.waitTime} minutes wait (${ride.status})`);
						let rideNameParsed = ride.name.replace(/[!-\/:-@[-`{-~]/g, '');
						this.MongoDB.insertOne("Rides", {name:rideNameParsed, time:new Date(), park:'Hollywood Studios', status:ride.status, waitTime:ride.waitTime});
					});
					
					DEBUG_MODE && logger.debug('GetHS() complete');
					resolve(this);
				})
			}
			catch (error) {
				logger.error("Hollywood Studios GetWaitTimes() failed: "+error);
				reject(this);
			}
		});
	}
};

module.exports = DisneyTimes;
