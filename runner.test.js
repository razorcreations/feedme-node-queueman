const request = require('request-promise');
const Runner = require('./runner');

jest.mock('request-promise');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Mock Date to always return the same date
const now = new Date();
Date = class extends Date {
	constructor() {
		super();
		return now;
	}
};

test('work executes callback', () => {
	const handle = jest.fn().mockResolvedValue([]);
	const runner = new Runner(handle);
	const cb = jest.fn();

	runner.work('foo', cb);

	return wait(5).then(() => {
		expect(handle).toHaveBeenCalledWith('foo');
		expect(cb).toHaveBeenCalledWith('success');
	});
});

test('work success sends callback', () => {
	const handle = jest.fn().mockResolvedValue([]);
	const runner = new Runner(handle);
	request.post.mockResolvedValue();

	runner.work({ callback_url: 'http://foo.com' }, () => {});

	return wait(5).then(() => {
		expect(request.post).toHaveBeenCalledWith({
			uri: 'http://foo.com',
			method: 'POST',
			body: { started_at: (new Date).toISOString() },
			json: true,
		});

		expect(request.post).toHaveBeenCalledWith({
			uri: 'http://foo.com',
			method: 'POST',
			body: { products: [] },
			json: true,
		});
	});
});

test('work fail sends error callback', () => {
	const handle = jest.fn().mockRejectedValue(new Error('something broke'));
	const runner = new Runner(handle);
	request.post.mockResolvedValue();

	runner.work({ callback_url: 'http://foo.com' }, () => {});

	return wait(5).then(() => {
		expect(request.post).toHaveBeenCalledWith({
			uri: 'http://foo.com',
			method: 'POST',
			body: { started_at: (new Date).toISOString() },
			json: true,
		});

		expect(request.post).toHaveBeenCalledWith({
			uri: 'http://foo.com',
			method: 'POST',
			body: { error: 'something broke' },
			json: true,
		});
	});
});
