import { Logger } from './logger.js';

export class ErrorHandler {
  constructor(agentName) {
    this.logger = new Logger(agentName);
  }

  handleError(error, context = '') {
    this.logger.error(`Error in ${context}:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return {
      success: false,
      error: error.message,
      context,
      timestamp: new Date().toISOString()
    };
  }

  handleAsyncError(asyncFn, context = '') {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        this.logger.error(`Async error in ${context}:`, {
          message: error.message,
          stack: error.stack,
          args: args
        });
        throw error;
      }
    };
  }

  validateInput(input, schema, context = '') {
    const errors = [];

    if (schema.required) {
      schema.required.forEach(field => {
        if (!input[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      });
    }

    if (schema.types) {
      Object.keys(schema.types).forEach(field => {
        if (input[field] && typeof input[field] !== schema.types[field]) {
          errors.push(`Invalid type for field ${field}: expected ${schema.types[field]}, got ${typeof input[field]}`);
        }
      });
    }

    if (errors.length > 0) {
      const error = new Error(`Validation failed in ${context}: ${errors.join(', ')}`);
      this.logger.error('Validation error:', { errors, input, context });
      throw error;
    }

    return true;
  }
}