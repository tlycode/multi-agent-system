#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { SupervisorAgent } from './agents/SupervisorAgent.js';
import { WebResearchAgent } from './agents/WebResearchAgent.js';
import { CRMResearchAgent } from './agents/CRMResearchAgent.js';

const argv = yargs(hideBin(process.argv))
  .command(
    'start-agents',
    'Start all agents in the system',
    {},
    startAgents
  )
  .command(
    'query <message>',
    'Send a query to the multi-agent system',
    (yargs) => {
      return yargs.positional('message', {
        describe: 'The message to process',
        type: 'string'
      });
    },
    processQuery
  )
  .command(
    'interactive',
    'Start interactive mode',
    {},
    startInteractive
  )
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .help()
  .alias('help', 'h')
  .parse();

async function startAgents() {
  console.log('Starting multi-agent system...');
  
  const webAgent = new WebResearchAgent(3001);
  const crmAgent = new CRMResearchAgent(3002);
  
  webAgent.start();
  crmAgent.start();
  
  console.log('All agents started successfully!');
  console.log('Web Research Agent: http://localhost:3001');
  console.log('CRM Research Agent: http://localhost:3002');
  console.log('\\nTo query the system, use: npm start query "your message"');
}

async function processQuery(argv) {
  const { message, verbose } = argv;
  
  if (verbose) {
    console.log(`Processing query: "${message}"`);
  }
  
  try {
    const supervisor = new SupervisorAgent(3000);
    
    await supervisor.initialize();
    
    const result = await supervisor.processUserRequest(message);
    
    console.log('\\n=== QUERY RESULT ===');
    console.log(`Input: ${result.userInput}`);
    console.log(`Success: ${result.success}`);
    
    if (result.success) {
      if (result.totalTasks > 1) {
        console.log(`\\nMultiple Tasks Detected: ${result.totalTasks}`);
        console.log(`Task Summary:`);
        Object.entries(result.taskSummary.taskTypes).forEach(([type, count]) => {
          console.log(`  - ${type}: ${count} task(s)`);
        });
        console.log(`Agents Used: ${result.agentsUsed?.join(', ') || 'None'}`);
        
        console.log('\\n=== OVERALL RESPONSE ===');
        console.log(result.overallResponse.summary);
        
        console.log('\\n=== TASK RESULTS ===');
        result.taskResults.forEach((taskResult, index) => {
          console.log(`\\n${index + 1}. ${taskResult.task}`);
          console.log(`   Type: ${taskResult.taskType?.join(', ') || 'N/A'}`);
          console.log(`   Status: ${taskResult.success ? 'SUCCESS' : 'FAILED'}`);
          
          if (taskResult.success && taskResult.response?.results?.length > 0) {
            taskResult.response.results.forEach(res => {
              console.log(`   ${res.agent}: ${res.result?.summary || 'Processed'}`);
            });
          } else if (!taskResult.success) {
            console.log(`   Error: ${taskResult.message}`);
          }
        });
        
        if (result.overallResponse.errors?.length > 0) {
          console.log('\\n=== ERRORS ===');
          result.overallResponse.errors.forEach(error => {
            console.log(`- Task: ${error.task || 'Unknown'}`);
            console.log(`  Agent: ${error.agent || 'N/A'}`);
            console.log(`  Error: ${error.error}`);
          });
        }
      } else {
        console.log(`Task Type: ${result.taskResults?.[0]?.taskType?.join(', ') || 'N/A'}`);
        console.log(`Agents Used: ${result.agentsUsed?.join(', ') || 'None'}`);
        console.log('\\n=== RESPONSE ===');
        console.log(result.overallResponse.summary);
        
        if (result.overallResponse.results?.length > 0) {
          console.log('\\n=== DETAILED RESULTS ===');
          result.overallResponse.results.forEach((res, index) => {
            console.log(`\\n${index + 1}. ${res.agent}:`);
            console.log(`   ${JSON.stringify(res.result, null, 2)}`);
          });
        }
        
        if (result.overallResponse.errors?.length > 0) {
          console.log('\\n=== ERRORS ===');
          result.overallResponse.errors.forEach(error => {
            console.log(`- ${error.agent || 'Unknown'}: ${error.error}`);
          });
        }
      }
    } else {
      console.log(`Error: ${result.message}`);
    }
    
  } catch (error) {
    console.error('Failed to process query:', error.message);
    if (verbose) {
      console.error(error.stack);
    }
  }
}

async function startInteractive() {
  console.log('Starting interactive mode...');
  console.log('Type "exit" to quit, "help" for commands\\n');
  
  const supervisor = new SupervisorAgent(3000);
  
  try {
    await supervisor.initialize();
    console.log('Supervisor initialized successfully\\n');
  } catch (error) {
    console.error('Failed to initialize supervisor:', error.message);
    console.log('Make sure agents are running with: npm start start-agents\\n');
  }
  
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });
  
  rl.prompt();
  
  rl.on('line', async (line) => {
    const input = line.trim();
    
    if (input === 'exit') {
      console.log('Goodbye!');
      rl.close();
      return;
    }
    
    if (input === 'help') {
      console.log('Commands:');
      console.log('  help - Show this help message');
      console.log('  exit - Exit interactive mode');
      console.log('  Any other input will be processed as a query');
      console.log('');
      rl.prompt();
      return;
    }
    
    if (input === '') {
      rl.prompt();
      return;
    }
    
    try {
      const result = await supervisor.processUserRequest(input);
      
      console.log(`\\n[${result.success ? 'SUCCESS' : 'FAILED'}] ${result.overallResponse?.summary || result.message}`);
      
      if (result.success && result.totalTasks > 1) {
        console.log(`  Completed ${result.totalTasks} tasks`);
        result.taskResults.forEach((taskResult, index) => {
          if (taskResult.success) {
            console.log(`  ${index + 1}. ${taskResult.task} - SUCCESS`);
          } else {
            console.log(`  ${index + 1}. ${taskResult.task} - FAILED`);
          }
        });
      } else if (result.success && result.overallResponse?.results?.length > 0) {
        result.overallResponse.results.forEach(res => {
          console.log(`  ${res.agent}: ${res.result.summary || 'Processed'}`);
        });
      }
      
      console.log('');
    } catch (error) {
      console.error('Error:', error.message);
      console.log('');
    }
    
    rl.prompt();
  });
  
  rl.on('close', () => {
    console.log('\\nExiting interactive mode...');
    process.exit(0);
  });
}

// Only show help if no command was executed
if (!argv._?.length && !argv.help && !argv.h) {
  console.log('Multi-Agent System CLI');
  console.log('Usage: npm start <command>');
  console.log('');
  console.log('Commands:');
  console.log('  start-agents     Start all agents');
  console.log('  query <message>  Send a query');
  console.log('  interactive      Start interactive mode');
  console.log('');
  console.log('Example:');
  console.log('  npm start start-agents');
  console.log('  npm start query "search for javascript tutorials"');
  console.log('  npm start interactive');
}