const winston = require('winston');
const { CONSTANTS } = require('../constants');
const { DATA_DIR } = CONSTANTS;
const { getDebug } = require('../userDataStore');

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.json()
	),
	transports: [
		new winston.transports.File({ filename: DATA_DIR + '/error.log', level: 'error' }),
		getDebug && new winston.transports.File({ filename: DATA_DIR + '/combined.log' })
	]
});

if (process.env.NODE_ENV !== 'production') {
	logger.add(new winston.transports.Console({
		format: winston.format.simple(),
		level: getDebug ? 'debug' : 'info'
	}));
}

module.exports = logger;
