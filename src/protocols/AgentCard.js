export class AgentCard {
  constructor({
    name,
    description,
    capabilities = [],
    supportedTasks = [],
    endpoint,
    version = "1.0.0",
    protocols = ["A2A", "MCP"]
  }) {
    this.name = name;
    this.description = description;
    this.capabilities = capabilities;
    this.supportedTasks = supportedTasks;
    this.endpoint = endpoint;
    this.version = version;
    this.protocols = protocols;
    this.createdAt = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      capabilities: this.capabilities,
      supportedTasks: this.supportedTasks,
      endpoint: this.endpoint,
      version: this.version,
      protocols: this.protocols,
      createdAt: this.createdAt
    };
  }

  static fromJSON(json) {
    return new AgentCard(json);
  }
}