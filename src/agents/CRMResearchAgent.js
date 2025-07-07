import express from 'express';
import { AgentCard } from '../protocols/AgentCard.js';
import { MCPProtocol } from '../protocols/MCP.js';

export class CRMResearchAgent {
  constructor(port = 3002) {
    this.port = port;
    this.app = express();
    this.mcp = new MCPProtocol();
    
    this.agentCard = new AgentCard({
      name: 'CRMResearchAgent',
      description: 'Specialized agent for CRM data analysis and customer research',
      capabilities: ['customer_lookup', 'contact_analysis', 'crm_queries'],
      supportedTasks: ['crm_research', 'customer_search', 'contact_lookup'],
      endpoint: `http://localhost:${port}`
    });

    this.mockCRMData = this.initializeMockData();
    this.setupMCPTools();
    this.setupRoutes();
  }

  initializeMockData() {
    return {
      customers: [
        {
          id: '001',
          name: 'John Doe',
          email: 'john.doe@example.com',
          company: 'Tech Corp',
          status: 'active',
          lastContact: '2024-01-15'
        },
        {
          id: '002',
          name: 'Jane Smith',
          email: 'jane.smith@business.com',
          company: 'Business Solutions',
          status: 'prospective',
          lastContact: '2024-01-10'
        },
        {
          id: '003',
          name: 'Bob Johnson',
          email: 'bob.johnson@startup.io',
          company: 'Startup Inc',
          status: 'inactive',
          lastContact: '2023-12-20'
        }
      ],
      interactions: [
        {
          customerId: '001',
          type: 'email',
          date: '2024-01-15',
          subject: 'Product inquiry',
          notes: 'Customer interested in premium features'
        },
        {
          customerId: '002',
          type: 'call',
          date: '2024-01-10',
          subject: 'Demo request',
          notes: 'Scheduled product demonstration'
        }
      ]
    };
  }

  setupMCPTools() {
    this.mcp.registerTool('customer_lookup', async (params) => {
      console.log("customer_lookup");
      const { query } = params;
      const queryLower = query.toLowerCase();
      console.log("query", queryLower);
      
      const matches = this.mockCRMData.customers.filter(customer => 
        customer.name.toLowerCase().includes(queryLower) ||
        customer.email.toLowerCase().includes(queryLower) ||
        customer.company.toLowerCase().includes(queryLower)
      );
      
      return {
        query,
        customers: matches,
        totalFound: matches.length,
        searchTime: Date.now()
      };
    }, 'Looks up customers in CRM system');

    this.mcp.registerTool('get_customer_interactions', async (params) => {
      console.log("get_customer_interactions");
      const { customerId } = params;
      
      const interactions = this.mockCRMData.interactions.filter(
        interaction => interaction.customerId === customerId
      );
      
      return {
        customerId,
        interactions,
        totalInteractions: interactions.length,
        retrievalTime: Date.now()
      };
    }, 'Retrieves customer interaction history');

    this.mcp.registerTool('crm_analytics', async (params) => {
      console.log("crm_analytics");
      const { metric } = params;
      
      const analytics = {
        totalCustomers: this.mockCRMData.customers.length,
        activeCustomers: this.mockCRMData.customers.filter(c => c.status === 'active').length,
        prospectiveCustomers: this.mockCRMData.customers.filter(c => c.status === 'prospective').length,
        inactiveCustomers: this.mockCRMData.customers.filter(c => c.status === 'inactive').length,
        totalInteractions: this.mockCRMData.interactions.length,
        lastUpdated: Date.now()
      };
      
      return metric ? { [metric]: analytics[metric] } : analytics;
    }, 'Provides CRM analytics and metrics');

    this.mcp.registerResource('customer_database', async (params) => {
      const { limit = 10, offset = 0 } = params;
      
      return {
        customers: this.mockCRMData.customers.slice(offset, offset + limit),
        total: this.mockCRMData.customers.length,
        offset,
        limit
      };
    }, 'Access to customer database');
  }

  setupRoutes() {
    this.app.use(express.json());

    this.app.get('/agent-card', (req, res) => {
      res.json(this.agentCard.toJSON());
    });

    this.app.post('/process', async (req, res) => {
      try {
        const { message, taskType } = req.body;
        const result = await this.processTask(message, taskType);
        
        res.json({
          success: true,
          agent: this.agentCard.name,
          taskType,
          result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          agent: this.agentCard.name,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    this.app.get('/capabilities', (req, res) => {
      res.json(this.mcp.getCapabilities());
    });
  }

  async processTask(message, taskType) {
    console.log(`CRMResearchAgent processing: ${message} (${taskType})`);

    console.log("taskType", taskType);

    if (taskType === 'crm_research' || taskType === 'customer_search') {
      const searchResult = await this.mcp.invokeTool('customer_lookup', { 
        query: message
      });
      
      return {
        type: 'customer_search',
        query: message,
        summary: `Found ${searchResult.customers.length} customers matching "${message}"`,
        data: searchResult
      };
    }
    
    if (taskType === 'contact_lookup') {
      const searchResult = await this.mcp.invokeTool('customer_lookup', { 
        query: message
      });
      
      if (searchResult.customers.length > 0) {
        const customer = searchResult.customers[0];
        const interactions = await this.mcp.invokeTool('get_customer_interactions', {
          customerId: customer.id
        });
        
        return {
          type: 'contact_lookup',
          customer,
          interactions: interactions.interactions,
          summary: `Found contact details and ${interactions.totalInteractions} interactions for ${customer.name}`,
          data: { customer, interactions }
        };
      }
      
      return {
        type: 'contact_lookup',
        query: message,
        summary: `No contact found for "${message}"`,
        data: { customer: null, interactions: [] }
      };
    }
    
    const analytics = await this.mcp.invokeTool('crm_analytics', {});
    
    return {
      type: 'general',
      message: `CRMResearchAgent processed: ${message}`,
      summary: 'Processed general CRM research request',
      analytics
    };
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`CRMResearchAgent running on port ${this.port}`);
    });
  }
}