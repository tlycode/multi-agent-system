export class TaskParser {
  constructor() {
    this.taskSeparators = [
      ' and ',
      ' then ',
      ' also ',
      ' plus ',
      ' additionally ',
      ' furthermore ',
      ' moreover ',
      '. ',
      ', and ',
      '; '
    ];
    
    this.webKeywords = [
      'search', 'find', 'google', 'web', 'internet', 'look up', 'news', 'article', 'website', 'online'
    ];
    
    this.crmKeywords = [
      'crm', 'customer', 'client', 'contact', 'hubspot', 'salesforce', 'history', 'record', 'account'
    ];
  }

  parseMultipleTasks(userInput) {
    const tasks = this.splitIntoTasks(userInput);
    
    return tasks.map(task => ({
      originalText: task.trim(),
      taskType: this.determineTaskType(task.trim()),
      priority: this.determinePriority(task.trim())
    }));
  }

  splitIntoTasks(userInput) {
    let tasks = [userInput];
    
    for (const separator of this.taskSeparators) {
      const newTasks = [];
      
      for (const task of tasks) {
        const splitTasks = task.split(separator);
        if (splitTasks.length > 1) {
          newTasks.push(...splitTasks.filter(t => t.trim().length > 0));
        } else {
          newTasks.push(task);
        }
      }
      
      tasks = newTasks;
    }
    
    return tasks
      .map(task => task.trim())
      .filter(task => task.length > 0)
      .map(task => this.cleanTask(task));
  }

  cleanTask(task) {
    task = task.replace(/^(and|then|also|plus|additionally|furthermore|moreover)\s+/i, '');
    
    task = task.replace(/^\W+/, '');
    task = task.replace(/\W+$/, '');
    
    if (!task.match(/[.!?]$/)) {
      task += '.';
    }
    
    return task;
  }

  determineTaskType(task) {
    const taskLower = task.toLowerCase();
    const types = [];
    
    const hasWebKeywords = this.webKeywords.some(keyword => 
      taskLower.includes(keyword)
    );
    
    const hasCRMKeywords = this.crmKeywords.some(keyword => 
      taskLower.includes(keyword)
    );
    
    if (hasWebKeywords) {
      types.push('web_research');
    }
    
    if (hasCRMKeywords) {
      types.push('crm_research');
    }
    
    if (types.length === 0) {
      if (taskLower.includes('pull') || taskLower.includes('get') || taskLower.includes('retrieve')) {
        types.push('crm_research');
      } else if (taskLower.includes('search') || taskLower.includes('find')) {
        types.push('web_research');
      } else {
        types.push('general');
      }
    }
    
    return types;
  }

  determinePriority(task) {
    const taskLower = task.toLowerCase();
    
    if (taskLower.includes('urgent') || taskLower.includes('asap') || taskLower.includes('immediately')) {
      return 'high';
    }
    
    if (taskLower.includes('when possible') || taskLower.includes('if you can')) {
      return 'low';
    }
    
    return 'medium';
  }

  getTaskSummary(tasks) {
    const summary = {
      totalTasks: tasks.length,
      taskTypes: {},
      priorities: {}
    };
    
    tasks.forEach(task => {
      task.taskType.forEach(type => {
        summary.taskTypes[type] = (summary.taskTypes[type] || 0) + 1;
      });
      
      summary.priorities[task.priority] = (summary.priorities[task.priority] || 0) + 1;
    });
    
    return summary;
  }
}