import axios from 'axios';

export class A2AProtocol {
  constructor() {
    this.discoveredAgents = new Map();
  }

  async discoverAgents(discoveryEndpoints = []) {
    const agents = [];
    
    for (const endpoint of discoveryEndpoints) {
      try {
        const response = await axios.get(`${endpoint}/agent-card`);
        const agentCard = response.data;
        
        this.discoveredAgents.set(agentCard.name, agentCard);
        agents.push(agentCard);
      } catch (error) {
        console.error(`Failed to discover agent at ${endpoint}:`, error.message);
      }
    }
    
    return agents;
  }

  async communicateWithAgent(agentName, message, taskType = null) {
    const agent = this.discoveredAgents.get(agentName);

    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }

    const allowedTaskType = agent.supportedTasks.filter(task => taskType.includes(task));
    if (allowedTaskType.length === 0) {
      throw new Error(`Agent ${agentName} does not support task type: ${taskType}`);
    }

    try {
      const response = await axios.post(`${agent.endpoint}/process`, {
        message,
        taskType,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to communicate with agent ${agentName}: ${error.message}`);
    }
  }

  getDiscoveredAgents() {
    return Array.from(this.discoveredAgents.values());
  }
}