// module: Queueman.Queuer
let fivebeans = require('fivebeans');
// Create a queue client


module.exports = function () {

	const client = new fivebeans.client('127.0.0.1', 11300);

	// Register client status listeners and connnect to queue
	client.on('connect', function () {
		// Successfully connected to the queue
		console.log((new Date).toUTCString() + ' Connected to queue');
	}).on('error', function (err) {
		// Connection to the queue failed
		console.error(err)
		reject("Queue connection error");
	}).on('close', function () {
		// Connection to the queue closed
		console.log((new Date).toUTCString() + " Queue connection closed")
	}).connect();

	function Queuer() {}

	// Adds a new job to the queue
	Queuer.prototype.add = function(data) {
		// Used by the worker
		let job = {
			type: "mainjob",
			payload: data,
		};


		return new Promise(function(fulfill, reject) {
			// Add a new job to the queue
			client.put(0, 0, 10, JSON.stringify(job), function(err, jobid) {
				if(err === null){
					// Job was added successfully
					console.log((new Date).toUTCString() + " Added to queue");
					fulfill("Added to queue");
				}else{
					//Something went wrong adding the job
					console.error(err);
					reject("Could not add job");
				}
			});
		});
	}

	// Return the class
	return new Queuer();
}
