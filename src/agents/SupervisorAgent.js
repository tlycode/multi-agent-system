import { AgentCard } from '../protocols/AgentCard.js';
import { A2AProtocol } from '../protocols/A2A.js';
import { TaskParser } from '../utils/TaskParser.js';

export class SupervisorAgent {
  constructor(port = 3000) {
    this.port = port;
    this.a2a = new A2AProtocol();
    this.taskParser = new TaskParser();
    this.agentCard = new AgentCard({
      name: 'SupervisorAgent',
      description: 'Coordinates and delegates tasks to specialized agents',
      capabilities: ['task_delegation', 'response_aggregation', 'agent_discovery'],
      supportedTasks: ['coordinate', 'delegate', 'aggregate'],
      endpoint: `http://localhost:${port}`
    });
  }

  async initialize() {
    const discoveryEndpoints = [
      'http://localhost:3001',
      'http://localhost:3002'
    ];

    console.log('Discovering agents...');
    const agents = await this.a2a.discoverAgents(discoveryEndpoints);
    console.log(`Discovered ${agents.length} agents:`, agents.map(a => a.name));
  }

  async processUserRequest(userInput) {
    console.log(`Processing request: ${userInput}`);
    
    const tasks = this.taskParser.parseMultipleTasks(userInput);
    console.log(`Parsed ${tasks.length} task(s):`, tasks.map(t => t.originalText));
    
    if (tasks.length === 0) {
      return {
        success: false,
        message: 'No valid tasks found in the input',
        userInput
      };
    }

    const taskResults = [];
    const allAgentsUsed = new Set();
    
    for (const task of tasks) {
      console.log(`\nProcessing task: ${task.originalText}`);
      
      const relevantAgents = this.findRelevantAgents(task.taskType);
      
      if (relevantAgents.length === 0) {
        taskResults.push({
          task: task.originalText,
          success: false,
          message: 'No suitable agents found for this task',
          taskType: task.taskType
        });
        continue;
      }

      const responses = await this.delegateToAgents(relevantAgents, task.originalText, task.taskType);
      const aggregatedResponse = this.aggregateResponses(responses);
      
      relevantAgents.forEach(agent => allAgentsUsed.add(agent.name));
      
      taskResults.push({
        task: task.originalText,
        success: true,
        taskType: task.taskType,
        priority: task.priority,
        agentsUsed: relevantAgents.map(a => a.name),
        response: aggregatedResponse
      });
    }

    const overallResponse = this.aggregateMultipleTaskResults(taskResults);
    
    console.log('Overall Response:', overallResponse.summary);
    return {
      success: true,
      userInput,
      totalTasks: tasks.length,
      taskSummary: this.taskParser.getTaskSummary(tasks),
      agentsUsed: Array.from(allAgentsUsed),
      taskResults,
      overallResponse
    };
  }

  determineTaskType(userInput) {
    const input = userInput.toLowerCase();

    let agents = [];
    if (input.includes('web') || input.includes('search') || input.includes('google') || input.includes('internet')) {
      agents.push('web_research');
    }
    
    if (input.includes('crm') || input.includes('customer') || input.includes('client') || input.includes('contact')) {
      agents.push('crm_research');
    }

    if (agents.length === 0) {
      agents.push('general');
    }
    return agents;
  }

  findRelevantAgents(taskType) {
    const discoveredAgents = this.a2a.getDiscoveredAgents();

    return discoveredAgents.filter(agent => {
      if (taskType.includes('web_research')) {
        return agent.name.toLowerCase().includes('web') || 
               agent.supportedTasks.includes('web_research');
      }
      
      if (taskType.includes('crm_research')) {
        return agent.name.toLowerCase().includes('crm') || 
               agent.supportedTasks.includes('crm_research');
      }
      
      return true;
    });
  }

  async delegateToAgents(agents, userInput, taskType) {
    const promises = agents.map(async (agent) => {
      try {
        const response = await this.a2a.communicateWithAgent(agent.name, userInput, taskType);
        return {
          agent: agent.name,
          success: true,
          response
        };
      } catch (error) {
        return {
          agent: agent.name,
          success: false,
          error: error.message
        };
      }
    });

    return Promise.all(promises);
  }

  aggregateResponses(responses) {
    const successful = responses.filter(r => r.success);
    const failed = responses.filter(r => !r.success);

    if (successful.length === 0) {
      return {
        summary: 'All agents failed to process the request',
        details: failed.map(f => ({ agent: f.agent, error: f.error }))
      };
    }

    const combinedResults = successful.map(r => ({
      agent: r.agent,
      result: r.response.result || r.response.message
    }));

    return {
      summary: `Successfully processed by ${successful.length} agent(s)`,
      results: combinedResults,
      errors: failed.length > 0 ? failed.map(f => ({ agent: f.agent, error: f.error })) : []
    };
  }

  aggregateMultipleTaskResults(taskResults) {
    const successfulTasks = taskResults.filter(t => t.success);
    const failedTasks = taskResults.filter(t => !t.success);
    
    const allResults = [];
    const allErrors = [];
    
    successfulTasks.forEach(task => {
      if (task.response && task.response.results) {
        console.log(task.task, task.response.results);
        task.response.results.forEach(result => {
          allResults.push({
            task: task.task,
            agent: result.agent,
            result: result.result
          });
        });
      }
      
      if (task.response && task.response.errors) {
        task.response.errors.forEach(error => {
          allErrors.push({
            task: task.task,
            agent: error.agent,
            error: error.error
          });
        });
      }
    });
    
    failedTasks.forEach(task => {
      allErrors.push({
        task: task.task,
        error: task.message
      });
    });
    
    return {
      summary: `Processed ${taskResults.length} task(s): ${successfulTasks.length} successful, ${failedTasks.length} failed`,
      totalTasks: taskResults.length,
      successfulTasks: successfulTasks.length,
      failedTasks: failedTasks.length,
      results: allResults,
      errors: allErrors
    };
  }

  getAgentCard() {
    return this.agentCard.toJSON();
  }
}