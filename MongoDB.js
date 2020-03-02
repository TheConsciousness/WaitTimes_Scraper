const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv').config()
let DEBUG_MODE = false;
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

if (!process.env.ENVIRONMENT) { logger.error("No ENV file, quitting."); process.exit(); }
if (process.env.ENVIRONMENT == 'dev' || process.env.ENVIRONMENT == 'test') DEBUG_MODE = true;

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
		if (this.isConnected()) { return; };
			
		DEBUG_MODE && logger.debug("MongoDB connect()");
		this.client.connect((err, db) => {
			if (err) {
				logger.error('MongoClient.connect() error: ' + err);
			}
			this.db = this.client.db(this.dbName);
		});
	}
	close() {
		this.client.close();
	}
	isConnected() {
		return !!this.client && !!this.client.topology && this.client.topology.isConnected();
	}
	insertOne(collName, row) {
		if (!this.isConnected()) { return "Not connected to Mongo."; };
		
		DEBUG_MODE && logger.debug("MongoDB insertOne()");
		this.db.collection(collName).insertOne(row, (err, res) => {
			if (err) {
				logger.error('insertOne() failed for '+collName+': ' + err);
			}
		});
	}
}

module.exports = MongoDB;
