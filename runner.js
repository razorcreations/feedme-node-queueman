const fivebeans = require('fivebeans');
const request = require('request-promise');

class Runner {
	constructor(
		handle,
		errorHandler = (() => {}),
		host = '127.0.0.1',
		port = 11300,
	) {
		this.handle = handle;
		this.errorHandler = errorHandler;
		this.host = host;
		this.port = port;
	}

	run() {
		const worker = new fivebeans.worker({
			id: 'worker_1',
			host: this.host,
			port: this.port,
			handlers: { mainjob: this },
			ignoreDefault: false,
		});

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

		worker.start();
	}

	work(payload, callback) {
		const callbackUrl = payload.callback_url;

		if (callbackUrl) {
			this.sendStartedCallback(callbackUrl);
		}

		this.handle(payload)
			.then((products) => {
				callback('success');

				this.log('Found a job!');
				this.log(`Found ${products.length} products`);

				if (callbackUrl) {
					this.sendResultCallback(callbackUrl, products);
				}

				this.log('Job complete!');
			})
			.catch((error) => {
				callback('success');

				this.errorHandler(error);
				this.log('Job failed, burying job!');

				if (callbackUrl) {
					this.sendErrorCallback(callbackUrl, error);
				}
			});
	}

	sendStartedCallback(url) {
		this.log(`Sending started callback to ${url}`);

		return this.sendCallback(url, { started_at: (new Date).toISOString() })
			.then(() => this.log('Sent started callback successfully'))
			.catch((error) => {
				this.errorHandler(error);
				this.log(`Failed to send started callback to ${url}`);
			});
	}

	sendResultCallback(url, products) {
		this.log(`Sending result callback to ${url}`);

		this.sendCallback(url, { products })
			.catch((error) => {
				this.errorHandler(error);
				this.log(`Failed to send products to ${url}`);
			});
	}

	sendErrorCallback(url, error) {
		this.log(`Sending error callback to ${url}`);

		if (typeof error === 'object' && error.message) {
			error = error.message;
		}

		this.sendCallback(url, { error })
			.then(() => this.log(`Sent error to ${url}`))
			.catch((error) => {
				this.errorHandler(error);
				this.log(`Failed to send error to ${url}`);
			});
	}

	sendCallback(url, data) {
		return request.post({
			uri: url,
			method: 'POST',
			body: data,
			json: true,
			timeout: 60 * 3,
		});
	}

	log(message) {
		console.log(`${(new Date).toUTCString()} ${message}`);
	}
}

module.exports = Runner;
