# Multi-Agent-System

A simple A2A protocol demo. Currently this doesn't use any LLM features,
but is a simple framework of how it would work. 

Since there is no attached LLM, and the primary purpose of this exercise 
was to use A2A and MCP, output for any input reflects proof of completion
instead of responding with information the customer would prefer.

## Architecture

This multi-agent system implements a hierarchical orchestration model using Agent-to-Agent (A2A) and Model Context Protocol (MCP) communication patterns.

### Core Components

#### Supervisor Layer
- **SupervisorAgent**: Central orchestrator that parses user requests, discovers task agents, delegates tasks, and aggregates responses from multiple specialized agents

#### Task Agents
- **WebResearchAgent** (port 3001): Handles web research and information gathering with capabilities like web_search, url_analysis, and content_extraction
- **CRMResearchAgent** (port 3002): Manages CRM data analysis and customer research with customer_lookup, contact_analysis, and crm_queries capabilities

#### Communication Protocols
- **A2A Protocol**: Enables agent-to-agent communication, discovery, and task delegation via HTTP
- **MCP Protocol**: Manages tool registration, resource access, and capability introspection within agents
- **AgentCard**: Handles agent identity and capability advertisement

### Data Flow
```
User Input → CLI → SupervisorAgent → TaskParser → Agent Selection → 
Task Delegation → Specialized Agents → Response Aggregation → Final Output
```

### Key Features
- **Multi-task Processing**: Parses complex queries into discrete tasks and processes them in parallel
- **Dynamic Agent Discovery**: Agents self-describe capabilities through standardized protocols
- **Extensible Architecture**: Easy addition of new agents and tools through protocol abstraction
- **Interactive CLI**: Supports multiple interaction modes (one-shot, interactive, batch)

### Agent Cards

Each agent exposes its capabilities through a standardized Agent Card:

#### SupervisorAgent
- **Name**: SupervisorAgent
- **Description**: Coordinates and delegates tasks to specialized agents
- **Capabilities**: `task_delegation`, `response_aggregation`, `agent_discovery`
- **Supported Tasks**: `coordinate`, `delegate`, `aggregate`
- **Endpoint**: `http://localhost:3000`

#### WebResearchAgent
- **Name**: WebResearchAgent
- **Description**: Specialized agent for web-based research and information gathering
- **Capabilities**: `web_search`, `url_analysis`, `content_extraction`
- **Supported Tasks**: `web_research`, `search_query`, `url_fetch`
- **Endpoint**: `http://localhost:3001`

#### CRMResearchAgent
- **Name**: CRMResearchAgent
- **Description**: Specialized agent for CRM data analysis and customer research
- **Capabilities**: `customer_lookup`, `contact_analysis`, `crm_queries`
- **Supported Tasks**: `crm_research`, `customer_search`, `contact_lookup`
- **Endpoint**: `http://localhost:3002`


## Instructions
To run the application, in one terminal run `npm start start-agents`
This will start the Web Research Agent and the CRM Research Agent.

Then, in a separate terminal window, run `npm start interactive` to start the Supervisor Agent and the CLI.

From here you can ask questions which the Supervisor agent will parse 
and delegate to the appropriate task agent (web or CRM).

## Sample input/output
As of now, the output only contains logs of what is happening with the various agents and not what a user/customer
would expect to see.

Input: `Find me info on Acme company and check if John Doe is a contact there.`

Output: 
> Processing request: find me info on acme company and check if john doe is a contact there

>Parsed 2 task(s): [
'find me info on acme company.',
'check if john doe is a contact there.'
]

>Processing task: find me info on acme company.

>[
{
agent: 'WebResearchAgent',
result: {
type: 'general',
message: 'WebResearchAgent processed: find me info on acme company.',
summary: 'Processed general web research request'
}
}
]

>Processing task: check if john doe is a contact there.

> [
{
agent: 'CRMResearchAgent',
result: {
type: 'general',
message: 'CRMResearchAgent processed: check if john doe is a contact there.',
summary: 'Processed general CRM research request',
analytics: [Object]
}
}
]

>Overall Response: Processed 2 task(s): 2 successful, 0 failed
\n[SUCCESS] Processed 2 task(s): 2 successful, 0 failed
>Completed 2 tasks
>1. find me info on acme company. - SUCCESS
>2. check if john doe is a contact there. - SUCCESS

## Future considerations / improvements
1. Instead of using primitive searches for exact strings to parse a 
string into tasks and delegate appropriately, using an LLM with specific 
prompts would be much more effective. 
2. Upgrade from JS to TS to ensure agents return
data in expected formats.
3. Mock data was the original expectation and would provide a better
overall experience. This project could also expand to use RAG or collect 
data beforehand for a more dynamic experience with a database.
4. Depending on size of agents and future scope of a project like this, 
creating a more robust structure for the agents would be beneficial. 
