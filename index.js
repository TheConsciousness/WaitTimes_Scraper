// index.js
// Run as service or cronjob
// Function: Call both parks functions once per {refreshRate};
//
// Wait Times Project - Scraper
//========================================================================================

const MongoDB = require('./MongoDB.js')
const GetUniversalTimes = require('./GetUniversalTimes.js')
const GetDisneyTimes = require('./GetDisneyTimes.js')
const MongoDBObj = new MongoDB('mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASS+'@'+process.env.MONGO_HOST, process.env.MONGO_DBNAME);
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

const refreshRate = 60000;

// she ain't pretty, but she seaworthy
const GetAllTimes = () => {
	
	const DisneyTimes = new GetDisneyTimes(MongoDBObj);
	DisneyTimes.GetMK().catch((error) => {logger.error("GetMK Main Failed: " + error)}).then(
		() => DisneyTimes.GetAK().catch((error) => {logger.error("GetAK Main Failed: " + error)}).then(
			() => DisneyTimes.GetEpcot().catch((error) => {logger.error("GetEpcot Main Failed: " + error)}).then(
				() => DisneyTimes.GetHS().catch((error) => {logger.error("GetHS Main Failed: " + error)}).then(
					() => {
						const UniversalTimes = new GetUniversalTimes(MongoDBObj);
						UniversalTimes.GetUSO().catch((error) => {logger.error("GetUSO Main Failed: " + error)}).then(
							() => UniversalTimes.GetIOA().catch((error) => {logger.error("GetIOA Main Failed: " + error)}).then(
								() => UniversalTimes.GetVB().catch((error) => {logger.error("GetVB Main Failed: " + error)})
							))
					})
				)
			)
		)
	
	

}

console.log("WaitTimes Scraper started.")
GetAllTimes();
setInterval(GetAllTimes, refreshRate); 
