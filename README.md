# Multi-Agent-System

A simple A2A protocol demo. Currently this doesn't use any LLM features,
but is a simple framework of how it would work. 

Since there is no attached LLM, and the primary purpose of this exercise 
was to use A2A and MCP, output for any input reflects proof of completion
instead of responding with information the customer would prefer.

## Architecture
### cli.js

### Agents

### Protocols


## Instructions
To run the appliaction, in one terminal run `npm start start-agents`
This will start the Web Research Agent and the CRM Research Agent.

Then run `npm start interactive` to start the Supervisor Agent and the CLI.

From here you can ask questions which the Supervisor agent will parse 
and delegate to the appropriate task agent (web or CRM).

## Sample input/output
Input: ` find me info on acme company and check if john doe is a contact there`

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