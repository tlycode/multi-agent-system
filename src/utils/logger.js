export class Logger {
  constructor(name) {
    this.name = name;
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      agent: this.name,
      message
    };

    if (data) {
      logEntry.data = data;
    }

    if (this.shouldLog(level)) {
      console.log(`[${timestamp}] [${level.toUpperCase()}] [${this.name}] ${message}`);
      if (data) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }

  shouldLog(level) {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] <= levels[this.logLevel];
  }

  error(message, data = null) {
    this.log('error', message, data);
  }

  warn(message, data = null) {
    this.log('warn', message, data);
  }

  info(message, data = null) {
    this.log('info', message, data);
  }

  debug(message, data = null) {
    this.log('debug', message, data);
  }
}