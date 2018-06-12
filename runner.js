// module: Queueman.Runner
let fivebeans = require('fivebeans');
let request = require('request-promise');

module.exports = function (handle, errorHandler) {

	function Runner(handle, errorHandler) {
		this.errorHandler = errorHandler || (() => {});
		const self = this;

		// Builds the handler used by the queue worker
		this.handler = function () {
			function MainJobHandler() {
				this.type = 'mainjob';
			}

			// Called within the fivebeans package
			MainJobHandler.prototype.work = function (payload, callback) {
				handle(payload).then(products => {
					callback('success');

					console.log((new Date).toUTCString() + " Found a job!");

					console.log((new Date).toUTCString() + " Found " + products.length + " products");

					if (payload.callback_url) {
						// If there is a callback_url send the deal_data back to it.
						let options = {
							uri: payload.callback_url,
							method: 'POST',
							body: {
								params: {},
								products,
							},
							json: true,
						};
						console.log((new Date).toUTCString() + " Sending request to: " + payload.callback_url);
						request.post(options).then(body => {
								console.log((new Date).toUTCString() + " Job complete!");
							},
							err => {
								console.log((new Date).toUTCString() + " Failed to send products to " + payload.callback_url);
								self.errorHandler(err);
							});
					}else{
						// No callback_url so just succeed.
						console.log((new Date).toUTCString() + " Job complete!");
					}

				}, err => {
					console.log((new Date).toUTCString() + " Job failed, burying job!");
					self.errorHandler(err);
					// If we have a callback_url send the error
					if (payload.callback_url) {
						if (typeof err === 'object' && err.message) {
							err = err.message;
						}

						let options = {
							uri: payload.callback_url,
							method: 'POST',
							body: {
								error: err,
							},
							json: true,
						};
						request.post(options).then(() => {
							console.log((new Date).toUTCString() + " Sent error to "+payload.callback_url);
						}, err => {
							console.log((new Date).toUTCString() + " Failed to send error to "+payload.callback_url);
							self.errorHandler(err);
						})
					}
				});
			}
			let handler = new MainJobHandler();
			return handler;
		}
	}

	// Starts the runner and attaches the handler
	Runner.prototype.run = function () {
		let options = {
			id: 'worker_1',
			host: '127.0.0.1',
			port: 11300,
			handlers: {
				mainjob: this.handler()
			},
			ignoreDefault: false,
		}
		let worker = new fivebeans.worker(options);

		worker.on('info', (info) => {
			console.log('==== INFO ====');
			console.log(info);
			console.log('==== INFO END ====');
		});

		worker.on('error', (err) => {
			console.log('==== ERROR ====');
			console.log(err);
			console.log('==== ERROR END ====');
			this.errorHandler(err);
		});

		worker.on('warning', (info) => {
			console.log('==== WARN ====');
			console.warn(info);
			console.log('==== END WARN ====');
			this.errorHandler(info.error);
		});

		worker.start('default');
	}

	// Return the class
	return new Runner(handle, errorHandler);
}
