import express from 'express';
import { AgentCard } from '../protocols/AgentCard.js';
import { MCPProtocol } from '../protocols/MCP.js';

export class WebResearchAgent {
  constructor(port = 3001) {
    this.port = port;
    this.app = express();
    this.mcp = new MCPProtocol();
    
    this.agentCard = new AgentCard({
      name: 'WebResearchAgent',
      description: 'Specialized agent for web-based research and information gathering',
      capabilities: ['web_search', 'url_analysis', 'content_extraction'],
      supportedTasks: ['web_research', 'search_query', 'url_fetch'],
      endpoint: `http://localhost:${port}`
    });

    this.setupMCPTools();
    this.setupRoutes();
  }

  setupMCPTools() {
    this.mcp.registerTool('web_search', async (params) => {
      const { query, maxResults = 5 } = params;
      console.log(`Searching for: ${query} (max results: ${maxResults})`);
      
      return {
        query,
        results: [
          {
            title: `Mock result 1 for: ${query}`,
            url: `https://example.com/result1?q=${encodeURIComponent(query)}`,
            snippet: `This is a mock search result for the query "${query}". In a real implementation, this would connect to a search API.`
          },
          {
            title: `Mock result 2 for: ${query}`,
            url: `https://example.com/result2?q=${encodeURIComponent(query)}`,
            snippet: `Another mock search result providing information about "${query}".`
          }
        ],
        totalResults: 2,
        searchTime: Date.now()
      };
    }, 'Performs web search queries');

    this.mcp.registerTool('url_fetch', async (params) => {
      const { url } = params;
      
      return {
        url,
        content: `Mock content from ${url}. In a real implementation, this would fetch and parse the actual webpage content.`,
        title: `Mock Title - ${url}`,
        metadata: {
          fetchTime: Date.now(),
          contentType: 'text/html',
          status: 200
        }
      };
    }, 'Fetches content from URLs');

    this.mcp.registerResource('search_history', async (_params) => {
      return {
        queries: [
          { query: 'sample query', timestamp: Date.now() - 10000 },
          { query: 'another query', timestamp: Date.now() - 5000 }
        ]
      };
    }, 'Access to search history');
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
    console.log(`WebResearchAgent processing: ${message} (${taskType})`);
    
    if (taskType === 'web_research' || taskType === 'search_query') {
      const searchResult = await this.mcp.invokeTool('web_search', { 
        query: message, 
        maxResults: 3 
      });
      
      return {
        type: 'web_search',
        query: message,
        summary: `Found ${searchResult.results.length} search results for "${message}"`,
        data: searchResult
      };
    }
    
    if (taskType === 'url_fetch') {
      const fetchResult = await this.mcp.invokeTool('url_fetch', { 
        url: message 
      });
      
      return {
        type: 'url_fetch',
        url: message,
        summary: `Successfully fetched content from ${message}`,
        data: fetchResult
      };
    }
    
    return {
      type: 'general',
      message: `WebResearchAgent processed: ${message}`,
      summary: 'Processed general web research request'
    };
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`WebResearchAgent running on port ${this.port}`);
    });
  }
}