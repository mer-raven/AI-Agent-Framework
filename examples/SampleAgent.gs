/**
 * AI Agent Framework - Sample Agent Implementation
 * Demonstrates how to create a custom agent using the framework
 */

/**
 * Sample Learning Assistant Agent
 * This example shows how to create a learning content assistant using the framework
 */

// Sample Intent Definitions
function getSampleIntentDefinitions() {
  return {
    search_by_category: {
      description: "Search for content by category",
      parameters: ["category", "keywords", "level"],
      examples: [
        {
          input: "Find programming training",
          output: {
            intent: "search_by_category",
            parameters: { category: "programming", keywords: ["training"], language: "english" },
            confidence: 0.9
          }
        },
        {
          input: "プログラミングのトレーニングを探して",
          output: {
            intent: "search_by_category", 
            parameters: { category: "programming", keywords: ["トレーニング"], language: "japanese" },
            confidence: 0.8
          }
        }
      ]
    },
    search_by_role: {
      description: "Search for content by target role",
      parameters: ["role", "keywords", "level"],
      examples: [
        {
          input: "Training for project managers",
          output: {
            intent: "search_by_role",
            parameters: { role: "manager", keywords: ["training"], language: "english" },
            confidence: 0.8
          }
        }
      ]
    },
    search_by_level: {
      description: "Search for content by difficulty level",
      parameters: ["level", "keywords", "category"],
      examples: [
        {
          input: "Beginner courses",
          output: {
            intent: "search_by_level",
            parameters: { level: "beginner", keywords: ["courses"], language: "english" },
            confidence: 0.7
          }
        }
      ]
    },
    help: {
      description: "Request help or information about available commands",
      parameters: [],
      examples: [
        {
          input: "help",
          output: {
            intent: "help",
            parameters: {},
            confidence: 1.0
          }
        }
      ]
    }
  };
}

// Sample Response Templates
function getSampleResponseTemplates() {
  return {
    english: {
      results_found: {
        header: "*Training Content Found:*\n\n",
        resultFormat: "• *{title}*\n  Description: {description}\n  Category: {category} | Level: {level} | Duration: {duration}\n  Tags: {tags}\n\n",
        footer: "\n📚 *{remaining} more results available.* Ask for more specific criteria to narrow down the search."
      },
      no_results: {
        message: "🔍 *No Training Content Found*\n\nI couldn't find any training content matching \"{query}\".",
        suggestionsHeader: "💡 *Try these suggestions:*",
        suggestionFormat: "• {suggestion}",
        suggestions: [
          "Use broader search terms",
          "Check available categories with 'help'",
          "Try searching by role or level",
          "Ask for beginner, intermediate, or advanced content"
        ]
      },
      help: {
        message: "🤖 *{agentName} Help*\n\n{description}\n\nI can help you find training and educational content!",
        examplesHeader: "📋 *Example Commands:*",
        exampleFormat: "• {example}",
        examples: [
          "Find programming training",
          "Show me management courses",
          "Training for developers",
          "Beginner Python courses",
          "Advanced technical training"
        ]
      },
      error: {
        message: "⚠️ *{agentName}*: I encountered an issue processing your request: \"{query}\"\n\nPlease try asking for training content or type \"help\" for assistance."
      },
      fallback: {
        message: "🤔 I'm not sure how to help with that request: \"{query}\"\n\nTry asking about training content or type \"help\" for available commands."
      }
    },
    japanese: {
      results_found: {
        header: "*トレーニングコンテンツが見つかりました:*\n\n",
        resultFormat: "• *{title}*\n  説明: {description}\n  カテゴリ: {category} | レベル: {level} | 時間: {duration}\n  タグ: {tags}\n\n",
        footer: "\n📚 *{remaining}件の追加結果があります。* より具体的な条件で検索を絞り込んでください。"
      },
      no_results: {
        message: "🔍 *トレーニングコンテンツが見つかりません*\n\n\"{query}\"に一致するトレーニングコンテンツが見つかりませんでした。",
        suggestionsHeader: "💡 *以下をお試しください:*",
        suggestionFormat: "• {suggestion}",
        suggestions: [
          "より広い検索用語を使用する",
          "「help」で利用可能なカテゴリを確認する", 
          "役職やレベルで検索する",
          "初級、中級、上級のコンテンツを指定する"
        ]
      },
      help: {
        message: "🤖 *{agentName} ヘルプ*\n\n{description}\n\nトレーニングや教育コンテンツを見つけるお手伝いをします！",
        examplesHeader: "📋 *コマンド例:*",
        exampleFormat: "• {example}",
        examples: [
          "プログラミングのトレーニングを探して",
          "マネジメントコースを見せて",
          "開発者向けのトレーニング",
          "初心者向けPythonコース",
          "上級技術トレーニング"
        ]
      },
      error: {
        message: "⚠️ *{agentName}*: リクエスト「{query}」の処理中に問題が発生しました。\n\nトレーニングコンテンツについて質問するか、「help」でサポートを求めてください。"
      },
      fallback: {
        message: "🤔 そのリクエスト「{query}」のお手伝い方法がわかりません。\n\nトレーニングコンテンツについて質問するか、「help」で利用可能なコマンドを確認してください。"
      }
    },
    default: {
      results_found: {
        header: "Results found:\n\n",
        resultFormat: "• {title}\n  {description}\n\n",
        footer: "\n{remaining} more results available."
      },
      no_results: {
        message: "No results found for: {query}",
        suggestions: ["Try different search terms", "Use help command"]
      },
      help: {
        message: "{agentName} Help\n\nAvailable commands and examples.",
        examples: ["search", "help"]
      },
      error: {
        message: "Error processing request: {query}"
      },
      fallback: {
        message: "I don't understand: {query}"
      }
    }
  };
}

// Sample Agent Configuration
function getSampleAgentConfig() {
  const baseConfig = getBaseFrameworkConfig();
  
  // Customize configuration for this specific agent
  return mergeConfigs(baseConfig, {
    system: {
      SYSTEM_NAME: "Learning Assistant Bot",
      AGENT_DESCRIPTION: "A helpful assistant for finding training and educational content",
      DEFAULT_LANGUAGE: "english",
      SUPPORTED_LANGUAGES: ["english", "japanese"]
    },
    openai: {
      USE_AI_RESPONSES: true,
      TEMPERATURE: 0.3
    },
    slack: {
      ENABLE_SLACK: true,
      MENTION_USERS: true,
      ENABLE_THREADS: true,
      ENABLE_EMOJI: true
    },
    // Custom search configuration
    categoryAliases: {
      "programming": ["development", "coding", "software"],
      "management": ["leadership", "project management", "pm"],
      "qa": ["quality assurance", "testing", "quality"],
      "ai": ["artificial intelligence", "machine learning", "ml", "data science"]
    },
    roleAliases: {
      "manager": ["project manager", "team lead", "supervisor"],
      "developer": ["programmer", "engineer", "coder"],
      "designer": ["ui designer", "ux designer", "graphic designer"]
    },
    genericKeywords: [
      'training', 'course', 'courses', 'class', 'classes',
      'content', 'material', 'materials', 'program', 'programs',
      'トレーニング', 'コース', 'クラス', 'コンテンツ', '教材', 'プログラム'
    ],
    keywordSearchFields: ['title', 'description', 'tags'],
    roleSearchFields: ['title', 'description', 'tags', 'target_audience'],
    typeSearchFields: ['type', 'format', 'tags'],
    maxDisplayResults: 5,
    addMetadata: true
  });
}

/**
 * Main function to create and run the sample agent
 * @param {string} userInput - User input to process
 * @param {Object} options - Processing options
 * @returns {Object} Processing result
 */
function runSampleAgent(userInput, options = {}) {
  console.log('Sample Learning Assistant Agent started');
  
  try {
    // Load configuration
    const agentConfig = getSampleAgentConfig();
    
    // Load intent definitions
    const intentDefinitions = getSampleIntentDefinitions();
    
    // Create data provider (using mock data for this example)
    const dataProvider = createDataProvider('mock');
    
    // Load response templates
    const responseTemplates = getSampleResponseTemplates();
    
    // Process the request using the framework
    const result = processFrameworkRequest(
      userInput,
      agentConfig,
      intentDefinitions,
      dataProvider,
      responseTemplates,
      options
    );
    
    console.log('Sample agent processing completed');
    return result;
    
  } catch (error) {
    console.error('Sample agent error:', error.message);
    return {
      success: false,
      error: error.message,
      response: `Sample agent encountered an error: ${error.message}`
    };
  }
}

/**
 * Slack integration wrapper for the sample agent
 * @param {string} userInput - User input
 * @param {Object} slackOptions - Slack-specific options
 * @returns {Object} Processing result
 */
function runSampleAgentForSlack(userInput, slackOptions = {}) {
  const options = {
    enableSlackPosting: true,
    enableLogging: true,
    ...slackOptions
  };
  
  return runSampleAgent(userInput, options);
}

/**
 * Test function to demonstrate the sample agent
 */
function testSampleAgent() {
  console.log('\n=== SAMPLE AGENT TEST ===\n');
  
  const testCases = [
    "Find programming training",
    "Show me QA courses", 
    "Training for managers",
    "Beginner courses",
    "プログラミングのトレーニングを探して",
    "help",
    "What is machine learning?"
  ];
  
  testCases.forEach((testInput, index) => {
    console.log(`\n--- Test ${index + 1}: "${testInput}" ---`);
    
    const result = runSampleAgent(testInput, {
      userId: 'test_user',
      channel: '#test',
      enableSlackPosting: false
    });
    
    if (result.success) {
      console.log('✅ Success');
      console.log(`Intent: ${result.intent}`);
      console.log(`Search Results: ${result.searchResultCount}`);
      console.log(`Response Type: ${result.responseType}`);
      console.log(`Response Preview: ${result.response.substring(0, 100)}...`);
    } else {
      console.log('❌ Failed');
      console.log(`Error: ${result.error}`);
      console.log(`Fallback Response: ${result.response}`);
    }
  });
  
  console.log('\n=== SAMPLE AGENT TEST COMPLETED ===\n');
}

/**
 * Configuration setup helper for new agents
 * This function helps set up a new agent based on the sample
 * @param {string} agentName - Name of the new agent
 * @param {string} description - Description of the agent
 * @param {Object} customConfig - Custom configuration overrides
 * @returns {Object} Configured agent setup
 */
function createCustomAgentSetup(agentName, description, customConfig = {}) {
  // Base configuration
  const baseConfig = getSampleAgentConfig();
  
  // Apply customizations
  const agentConfig = mergeConfigs(baseConfig, {
    system: {
      SYSTEM_NAME: agentName,
      AGENT_DESCRIPTION: description,
      ...customConfig.system
    },
    ...customConfig
  });
  
  // Default intent definitions (can be customized)
  const intentDefinitions = customConfig.intentDefinitions || getSampleIntentDefinitions();
  
  // Default response templates (can be customized)
  const responseTemplates = customConfig.responseTemplates || getSampleResponseTemplates();
  
  // Data provider (needs to be specified for real usage)
  const dataProvider = customConfig.dataProvider || createDataProvider('mock');
  
  return {
    agentConfig,
    intentDefinitions,
    responseTemplates,
    dataProvider,
    
    // Helper function to run this agent
    run: function(userInput, options = {}) {
      return processFrameworkRequest(
        userInput,
        agentConfig,
        intentDefinitions,
        dataProvider,
        responseTemplates,
        options
      );
    },
    
    // Helper function to save configuration
    saveConfig: function() {
      return saveAgentConfig(agentName, agentConfig);
    }
  };
}

/**
 * Example: Creating a Custom IT Support Agent
 */
function createITSupportAgent() {
  return createCustomAgentSetup(
    "IT Support Assistant",
    "A helpful assistant for IT support and troubleshooting",
    {
      system: {
        SUPPORTED_LANGUAGES: ["english"]
      },
      // Custom intent definitions for IT support
      intentDefinitions: {
        troubleshoot_issue: {
          description: "Help troubleshoot technical issues",
          parameters: ["issue_type", "severity", "keywords"]
        },
        request_access: {
          description: "Request access to systems or resources",
          parameters: ["resource_type", "access_level", "justification"]
        },
        search_documentation: {
          description: "Search IT documentation and guides",
          parameters: ["topic", "keywords", "doc_type"]
        },
        help: {
          description: "Get help with available IT support commands",
          parameters: []
        }
      },
      // Custom data provider for IT documentation
      dataProvider: createDataProvider('sheets') // Would use IT docs sheet
    }
  );
}

/**
 * Example: Creating a Custom HR Policy Agent
 */
function createHRPolicyAgent() {
  return createCustomAgentSetup(
    "HR Policy Assistant", 
    "A helpful assistant for HR policies and employee questions",
    {
      categoryAliases: {
        "benefits": ["health insurance", "retirement", "401k"],
        "policies": ["hr policy", "company policy", "procedures"],
        "leave": ["vacation", "pto", "sick leave", "maternity"]
      },
      // Would have custom intent definitions and response templates
      // for HR-specific use cases
    }
  );
} 