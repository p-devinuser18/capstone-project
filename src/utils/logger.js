const winston = require('winston');

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true })
    ),
    transports: [
        new winston.transports.Console({
            format:
                process.env.NODE_ENV === 'production'
                    ? winston.format.combine(
                          winston.format.timestamp(),
                          winston.format.json()
                      )
                    : winston.format.combine(
                          winston.format.timestamp(),
                          winston.format.colorize(),
                          winston.format.printf(({ timestamp, level, message, ...meta }) => {
                              const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                              return `${timestamp} [${level}]: ${message}${metaStr}`;
                          })
                      )
        })
    ]
});

module.exports = logger;
