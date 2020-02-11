const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv').config()
let DEBUG_MODE = false;

if (!process.env.ENVIRONMENT) { console.log("No ENV file, quitting."); process.exit(); }
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
		if (!this.isConnected()) { return "Not connected to Mongo."; };
		
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

module.exports = MongoDB;