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

const refreshRate = 10000;

// she ain't pretty, but she seaworthy
const GetAllTimes = () => {

	const DisneyTimes = new GetDisneyTimes(MongoDBObj);

	DisneyTimes.GetMK().then(
		() => DisneyTimes.GetAK().then(
			() => DisneyTimes.GetEpcot().then(
				() => DisneyTimes.GetHS().then(
					() => {
						const UniversalTimes = new GetUniversalTimes(MongoDBObj);
							UniversalTimes.GetUSO().catch((errorlog) => console.log("GetUSO() .catch: "+errorlog)).then(
								() => UniversalTimes.GetIOA().then(
									() => UniversalTimes.GetVB()
							)
						)
					}
			)
		)
	))
}

setInterval(GetAllTimes, refreshRate); 
