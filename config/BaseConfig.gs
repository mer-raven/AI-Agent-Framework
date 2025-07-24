/**
 * AI Agent Framework - Base Configuration System
 * Provides configurable settings for different types of AI agents
 */

/**
 * Base configuration template that should be extended for specific agent implementations
 * @returns {Object} Base configuration object
 */
function getBaseFrameworkConfig() {
  return {
    // Framework metadata
    framework: {
      name: "AI Agent Framework",
      version: "1.0.0",
      description: "Configurable multi-agent framework for Slack bots"
    },
    
    // System settings (should be overridden by specific implementations)
    system: {
      SYSTEM_NAME: "Generic AI Agent",
      AGENT_DESCRIPTION: "A configurable AI agent",
      DEFAULT_LANGUAGE: "english",
      SUPPORTED_LANGUAGES: ["english", "japanese"],
      SESSION_TIMEOUT: 3600000 // 1 hour
    },
    
    // OpenAI API settings
    openai: {
      MODEL: "gpt-3.5-turbo",
      MAX_TOKENS: 1500,
      TEMPERATURE: 0.3,
      DEFAULT_ROLE: "You are a helpful AI assistant."
    },
    
    // Slack integration settings
    slack: {
      ENABLE_SLACK: true,
      DEFAULT_CHANNEL: "#general",
      MENTION_USERS: true,
      ENABLE_THREADS: true,
      ENABLE_EMOJI: true,
      API_DELAY_MS: 1000,
      MAX_API_CALLS_PER_RUN: 50
    },
    
    // Google Sheets integration settings
    sheets: {
      ENABLE_SHEETS: true,
      ENABLE_LOGGING: true,
      LOG_SHEET_NAME: "Agent_Logs",
      DATA_SHEET_NAME: "Agent_Data"
    },
    
    // Agent processing settings
    processing: {
      DEFAULT_CONFIDENCE_THRESHOLD: 0.5,
      MAX_RETRY_COUNT: 3,
      PROCESSING_TIMEOUT: 30000, // 30 seconds
      ENABLE_CACHING: true
    },
    
    // Error handling settings
    errorHandling: {
      ENABLE_FALLBACK_RESPONSES: true,
      LOG_ERRORS: true,
      RETURN_TECHNICAL_ERRORS: false
    }
  };
}

/**
 * Load agent-specific configuration from PropertiesService
 * @param {string} agentName - Name of the specific agent
 * @returns {Object} Agent-specific configuration
 */
function loadAgentConfig(agentName) {
  const baseConfig = getBaseFrameworkConfig();
  
  try {
    // Load agent-specific settings from PropertiesService
    const properties = PropertiesService.getScriptProperties();
    const agentSpecificConfig = properties.getProperty(`${agentName}_CONFIG`);
    
    if (agentSpecificConfig) {
      const customConfig = JSON.parse(agentSpecificConfig);
      return mergeConfigs(baseConfig, customConfig);
    }
    
    return baseConfig;
  } catch (error) {
    console.warn(`Failed to load config for ${agentName}:`, error.message);
    return baseConfig;
  }
}

/**
 * Deep merge two configuration objects
 * @param {Object} baseConfig - Base configuration
 * @param {Object} customConfig - Custom configuration to merge
 * @returns {Object} Merged configuration
 */
function mergeConfigs(baseConfig, customConfig) {
  const merged = JSON.parse(JSON.stringify(baseConfig));
  
  function deepMerge(target, source) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
  }
  
  deepMerge(merged, customConfig);
  return merged;
}

/**
 * Save agent-specific configuration to PropertiesService
 * @param {string} agentName - Name of the specific agent
 * @param {Object} config - Configuration to save
 * @returns {boolean} Success status
 */
function saveAgentConfig(agentName, config) {
  try {
    const properties = PropertiesService.getScriptProperties();
    properties.setProperty(`${agentName}_CONFIG`, JSON.stringify(config));
    console.log(`Configuration saved for ${agentName}`);
    return true;
  } catch (error) {
    console.error(`Failed to save config for ${agentName}:`, error.message);
    return false;
  }
}

/**
 * Get API credentials from PropertiesService
 * @param {string} agentName - Name of the specific agent
 * @returns {Object} API credentials
 */
function getAgentCredentials(agentName) {
  try {
    const properties = PropertiesService.getScriptProperties();
    
    return {
      OPENAI_API_KEY: properties.getProperty(`${agentName}_OPENAI_API_KEY`) || properties.getProperty('OPENAI_API_KEY'),
      SLACK_BOT_TOKEN: properties.getProperty(`${agentName}_SLACK_BOT_TOKEN`) || properties.getProperty('SLACK_BOT_TOKEN'),
      SHEET_ID: properties.getProperty(`${agentName}_SHEET_ID`) || properties.getProperty('SHEET_ID')
    };
  } catch (error) {
    console.error(`Failed to load credentials for ${agentName}:`, error.message);
    return {};
  }
}

/**
 * Validate configuration object
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result
 */
function validateAgentConfig(config) {
  const errors = [];
  
  // Required sections check
  const requiredSections = ['system', 'openai', 'slack', 'sheets'];
  for (const section of requiredSections) {
    if (!config[section]) {
      errors.push(`Missing required configuration section: ${section}`);
    }
  }
  
  // Required API settings check
  if (config.openai && !config.openai.MODEL) {
    errors.push('OpenAI model not specified');
  }
  
  if (config.system && !config.system.SYSTEM_NAME) {
    errors.push('System name not specified');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
} 