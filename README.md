# AI Agent Framework

A powerful and flexible framework for building intelligent Slack bots and AI agents using Google Apps Script. Based on the proven 4-Agent architecture from the Learning Contents Agent project.

## 🌟 Features

- **4-Agent Architecture**: InputParser → ContentRetriever → ResponseGenerator → Logger
- **Multilingual Support**: Built-in support for English and Japanese (easily extensible)
- **Pluggable Data Sources**: Support for Google Sheets, REST APIs, JSON, and custom providers
- **Slack Integration**: Native threading, mentions, emoji support
- **Configurable Templates**: Customizable response templates and intent definitions
- **Error Handling**: Comprehensive error handling with fallback responses
- **Logging & Analytics**: Built-in logging to Google Sheets with detailed metrics
- **OpenAI Integration**: Intelligent intent parsing and response generation

## 🏗️ Architecture

```
User Input → InputParser → ContentRetriever → ResponseGenerator → [Slack/Webhooks] → Logger
                ↓              ↓                ↓
           Intent & Params   Search Results   Formatted Response
```

## 🚀 Quick Start

### 1. Basic Setup

```javascript
// Load the framework
const agentConfig = getBaseFrameworkConfig();
const intentDefinitions = getSampleIntentDefinitions();
const dataProvider = createDataProvider('mock'); // or 'sheets', 'api'
const responseTemplates = getSampleResponseTemplates();

// Process a user request
const result = processFrameworkRequest(
  "Find programming courses",
  agentConfig,
  intentDefinitions,
  dataProvider,
  responseTemplates
);

console.log(result.response);
```

### 2. Using the Sample Agent

```javascript
// Run the pre-built sample agent
const result = runSampleAgent("Show me QA training", {
  userId: 'user123',
  channel: '#general',
  enableSlackPosting: true
});
```

### 3. Creating a Custom Agent

```javascript
// Create your own agent
const myAgent = createCustomAgentSetup(
  "IT Support Bot",
  "Helpful IT support assistant",
  {
    // Custom configuration
    categoryAliases: {
      "network": ["wifi", "internet", "connectivity"],
      "hardware": ["laptop", "desktop", "printer"]
    },
    // Custom intents, templates, data provider
  }
);

// Use your agent
const result = myAgent.run("Help with network issues");
```

## 📁 Framework Structure

```
AI Agent framework/
├── config/
│   └── BaseConfig.gs              # Configuration system
├── core/
│   ├── agents/
│   │   ├── InputParserAgent.gs    # Intent classification
│   │   ├── ContentRetrieverAgent.gs # Data search & filtering
│   │   └── ResponseGeneratorAgent.gs # Response generation
│   ├── utils/
│   │   └── DataProviderInterface.gs # Data source abstractions
│   └── FrameworkOrchestrator.gs   # Main workflow coordinator
├── examples/
│   └── SampleAgent.gs             # Complete example implementation
├── templates/                     # Template configurations
└── docs/                          # Documentation
```

## 🔧 Configuration

### Agent Configuration

```javascript
const agentConfig = {
  system: {
    SYSTEM_NAME: "My Bot",
    AGENT_DESCRIPTION: "A helpful assistant",
    SUPPORTED_LANGUAGES: ["english", "japanese"]
  },
  openai: {
    MODEL: "gpt-3.5-turbo",
    USE_AI_RESPONSES: true,
    TEMPERATURE: 0.3
  },
  slack: {
    ENABLE_SLACK: true,
    ENABLE_THREADS: true,
    MENTION_USERS: true
  },
  // Custom search configurations
  categoryAliases: {
    "programming": ["development", "coding"]
  }
};
```

### Intent Definitions

```javascript
const intentDefinitions = {
  search_by_category: {
    description: "Search for content by category",
    parameters: ["category", "keywords", "level"],
    examples: [
      {
        input: "Find programming training",
        output: {
          intent: "search_by_category",
          parameters: { category: "programming", keywords: ["training"] }
        }
      }
    ]
  }
};
```

### Response Templates

```javascript
const responseTemplates = {
  english: {
    results_found: {
      header: "*Results Found:*\n\n",
      resultFormat: "• *{title}*\n  {description}\n\n",
      footer: "\n{remaining} more results available."
    },
    no_results: {
      message: "No results found for: {query}",
      suggestions: ["Try broader terms", "Check spelling"]
    }
  }
};
```

## 📊 Data Providers

### Google Sheets Provider

```javascript
// Automatically loads from configured Google Sheets
const dataProvider = createDataProvider('sheets');
```

### Mock Data Provider

```javascript
// Uses built-in sample data for testing
const dataProvider = createDataProvider('mock');
```

### REST API Provider

```javascript
// Loads data from external API
const dataProvider = createDataProvider('api', {
  url: 'https://api.example.com/data',
  apiConfig: {
    authType: 'bearer',
    headers: { 'Custom-Header': 'value' }
  }
});
```

### Custom JSON Provider

```javascript
// Uses predefined JSON data
const myData = [
  { title: "Course 1", category: "Programming" },
  { title: "Course 2", category: "Design" }
];
const dataProvider = createDataProvider('json', { data: myData });
```

## 🤖 Slack Integration

### Basic Setup

1. **Configure PropertiesService:**
   ```javascript
   // Set these in Google Apps Script
   PropertiesService.getScriptProperties().setProperties({
     'MY_BOT_OPENAI_API_KEY': 'your_openai_key',
     'MY_BOT_SLACK_BOT_TOKEN': 'xoxb-your-slack-token',
     'MY_BOT_SHEET_ID': 'your_google_sheet_id'
   });
   ```

2. **Enable Slack Features:**
   ```javascript
   const options = {
     enableSlackPosting: true,
     userId: 'user123',
     channel: '#general',
     threadTs: 'optional_thread_timestamp'
   };
   ```

### Threading Support

The framework automatically handles Slack threading:

```javascript
// Original message creates thread
const result1 = runAgent("Find courses", { threadTs: null });

// Follow-up uses same thread
const result2 = runAgent("Tell me more", { 
  threadTs: result1.integrations.slack.messageTs 
});
```

## 📈 Logging & Analytics

### Automatic Logging

```javascript
const result = processFrameworkRequest(userInput, config, intents, provider, templates, {
  enableLogging: true  // Logs to Google Sheets automatically
});
```

### Log Data Structure

```javascript
{
  sessionId: "fw_1234567890_abc",
  userInput: "Find programming courses",
  intent: "search_by_category",
  parameters: { category: "programming" },
  searchResultCount: 5,
  responseType: "results_found",
  processingTime: 1250,
  success: true,
  integrations: { slack: { success: true } }
}
```

## 🔌 Extending the Framework

### Custom Agents

```javascript
// 1. Define your domain-specific intents
const customIntents = {
  book_meeting: {
    description: "Book a meeting room",
    parameters: ["room", "datetime", "duration"]
  }
};

// 2. Create custom response templates
const customTemplates = {
  english: {
    meeting_booked: {
      message: "✅ Meeting room {room} booked for {datetime}"
    }
  }
};

// 3. Create custom data provider
const roomProvider = createCustomRoomProvider();

// 4. Use the framework
const result = processFrameworkRequest(
  "Book conference room A for 2pm",
  agentConfig,
  customIntents,
  roomProvider,
  customTemplates
);
```

### Custom Data Providers

```javascript
function createCustomDataProvider() {
  return {
    loadData: function(agentConfig) {
      // Your custom data loading logic
      return {
        success: true,
        data: yourData,
        metadata: { source: 'Custom', rows: yourData.length }
      };
    },
    
    validateData: function(data) {
      // Your validation logic
      return { valid: true, errors: [] };
    },
    
    getMetadata: function() {
      return {
        name: 'Custom Provider',
        version: '1.0.0',
        description: 'My custom data source'
      };
    }
  };
}
```

## 🧪 Testing

### Unit Testing

```javascript
// Test the sample agent
testSampleAgent();

// Test individual components
const parseResult = processInputParsing("test input", config, intents);
const searchResult = processContentRetrieval("intent", params, config, provider);
```

### Integration Testing

```javascript
// Test complete workflow without Slack
const result = runSampleAgent("test query", {
  enableSlackPosting: false,
  enableLogging: false
});
```

## 🛠️ Development Workflow

### 1. Plan Your Agent

- Define the domain (IT support, HR policies, etc.)
- List the types of queries users will ask
- Design your data structure

### 2. Configure Components

```javascript
// Start with the sample agent
const myAgent = createCustomAgentSetup("My Agent", "Description", {
  // Your customizations
});
```

### 3. Test & Iterate

```javascript
// Test with mock data first
const mockProvider = createDataProvider('mock');

// Then switch to real data
const realProvider = createDataProvider('sheets');
```

### 4. Deploy

- Set up PropertiesService credentials
- Configure Slack app and permissions
- Enable triggers for real-time processing

## 📚 Examples

### Learning Assistant (Built-in)
- Search training content by category, role, level
- Multilingual support (EN/JP)
- Smart keyword filtering

### IT Support Bot
```javascript
const itAgent = createITSupportAgent();
const result = itAgent.run("WiFi not working");
```

### HR Policy Assistant
```javascript
const hrAgent = createHRPolicyAgent();
const result = hrAgent.run("What is the vacation policy?");
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request

## 📄 License

This framework is built upon the Learning Contents Agent project and is designed for educational and commercial use.

## 🆘 Support

- Check the `examples/` folder for implementation patterns
- Review the `SampleAgent.gs` for complete examples
- Test with mock data before deploying to production
- Use the built-in logging to debug issues

## 🎯 Best Practices

1. **Start Small**: Begin with the sample agent and customize incrementally
2. **Test Thoroughly**: Use mock data providers during development
3. **Monitor Performance**: Check processing times in logs
4. **Handle Errors**: Implement graceful fallbacks for API failures
5. **Secure Credentials**: Always use PropertiesService for API keys
6. **Version Control**: Track changes to intents and templates
7. **User Feedback**: Monitor logs to improve response quality

---

**Built with ❤️ using Google Apps Script and OpenAI** 