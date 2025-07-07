export class MCPProtocol {
  constructor() {
    this.tools = new Map();
    this.resources = new Map();
  }

  registerTool(name, handler, description = '') {
    this.tools.set(name, {
      handler,
      description,
      schema: {
        type: 'function',
        name,
        description
      }
    });
  }

  registerResource(name, accessor, description = '') {
    this.resources.set(name, {
      accessor,
      description,
      schema: {
        type: 'resource',
        name,
        description
      }
    });
  }

  async invokeTool(name, parameters = {}) {
    const tool = this.tools.get(name);
    
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    try {
      return await tool.handler(parameters);
    } catch (error) {
      throw new Error(`Tool ${name} execution failed: ${error.message}`);
    }
  }

  async accessResource(name, parameters = {}) {
    const resource = this.resources.get(name);
    
    if (!resource) {
      throw new Error(`Resource ${name} not found`);
    }

    try {
      return await resource.accessor(parameters);
    } catch (error) {
      throw new Error(`Resource ${name} access failed: ${error.message}`);
    }
  }

  getCapabilities() {
    return {
      tools: Array.from(this.tools.values()).map(tool => tool.schema),
      resources: Array.from(this.resources.values()).map(resource => resource.schema)
    };
  }
}