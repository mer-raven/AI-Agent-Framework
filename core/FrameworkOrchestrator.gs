/**
 * AI Agent Framework - Main Orchestrator
 * Coordinates all agents and manages the complete workflow
 */

/**
 * Main entry point for processing user requests through the framework
 * @param {string} userInput - User input text
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} intentDefinitions - Intent definitions for this agent
 * @param {Object} dataProvider - Data provider implementation
 * @param {Object} responseTemplates - Response templates
 * @param {Object} options - Processing options
 * @returns {Object} Complete processing result
 */
function processFrameworkRequest(userInput, agentConfig, intentDefinitions, dataProvider, responseTemplates, options = {}) {
  console.log(`${agentConfig.system.SYSTEM_NAME} Framework started:`, userInput);
  
  const sessionId = generateFrameworkSessionId();
  const startTime = Date.now();
  
  // Default option settings
  const defaultOptions = {
    userId: 'anonymous',
    channel: '#general',
    enableLogging: true,
    enableSlackPosting: false,
    enableWebhooks: false,
    retryCount: 3,
    timeout: 30000
  };
  
  const config = { ...defaultOptions, ...options };
  
  try {
    // Validate framework inputs
    const validation = validateFrameworkInputs(userInput, agentConfig, intentDefinitions, dataProvider, responseTemplates);
    if (!validation.valid) {
      return handleFrameworkError('Input validation error', validation.errors.join(', '), sessionId, userInput, config);
    }
    
    // === 1. Input Parser Agent ===
    console.log('1. Framework Input Parser Agent started');
    const inputParseResult = processInputParsing(userInput, agentConfig, intentDefinitions);
    
    if (!inputParseResult.success) {
      return handleFrameworkError('Input parsing error', inputParseResult.error, sessionId, userInput, config);
    }
    
    console.log('Input parsing completed:', inputParseResult.intent);
    
    // === 2. Content Retriever Agent ===
    console.log('2. Framework Content Retriever Agent started');
    const searchResult = processContentRetrieval(inputParseResult.intent, inputParseResult.parameters, agentConfig, dataProvider);
    
    if (!searchResult.success) {
      return handleFrameworkError('Content search error', searchResult.error, sessionId, userInput, config);
    }
    
    console.log('Content search completed:', searchResult.totalCount, 'results');
    
    // === 3. Response Generator Agent ===
    console.log('3. Framework Response Generator Agent started');
    const responseResult = processResponseGeneration(
      inputParseResult.intent,
      inputParseResult.parameters,
      searchResult.results,
      userInput,
      agentConfig,
      responseTemplates
    );
    
    if (!responseResult.success) {
      return handleFrameworkError('Response generation error', responseResult.error, sessionId, userInput, config);
    }
    
    console.log('Response generation completed');
    
    // === 4. Integration Processing ===
    const integrationResults = {};
    
    // Slack integration
    if (config.enableSlackPosting && agentConfig.slack.ENABLE_SLACK) {
      console.log('4a. Slack integration started');
      const slackResult = processSlackIntegration(responseResult.response, config, agentConfig);
      integrationResults.slack = slackResult;
      
      if (slackResult.success) {
        console.log('Slack integration completed');
      } else {
        console.warn('Slack integration failed:', slackResult.error);
      }
    }
    
    // Webhook integration
    if (config.enableWebhooks && agentConfig.webhooks && agentConfig.webhooks.ENABLE_WEBHOOKS) {
      console.log('4b. Webhook integration started');
      const webhookResult = processWebhookIntegration(sessionId, userInput, responseResult, config, agentConfig);
      integrationResults.webhooks = webhookResult;
    }
    
    // === 5. Logger Agent ===
    if (config.enableLogging && agentConfig.sheets.ENABLE_LOGGING) {
      console.log('5. Framework Logger Agent started');
      const logData = createFrameworkLogData(
        sessionId,
        userInput,
        inputParseResult,
        searchResult,
        responseResult,
        integrationResults,
        config,
        startTime
      );
      
      const logResult = processFrameworkLogging(logData, agentConfig);
      if (!logResult.success) {
        console.warn('Logging failed:', logResult.error);
      } else {
        console.log('Logging completed');
      }
    }
    
    // === 6. Cleanup and Response ===
    const processingTime = Date.now() - startTime;
    console.log(`${agentConfig.system.SYSTEM_NAME} Framework completed: ${processingTime}ms`);
    
    return {
      success: true,
      sessionId: sessionId,
      intent: inputParseResult.intent,
      parameters: inputParseResult.parameters,
      searchResultCount: searchResult.totalCount,
      response: responseResult.response,
      responseType: responseResult.responseType,
      integrations: integrationResults,
      processingTime: processingTime,
      metadata: {
        agentName: agentConfig.system.SYSTEM_NAME,
        version: agentConfig.framework.version,
        timestamp: new Date(),
        userId: config.userId,
        channel: config.channel
      }
    };
    
  } catch (error) {
    console.error('Framework orchestrator error:', error.message);
    return handleFrameworkError('Framework error', error.message, sessionId, userInput, config);
  }
}

/**
 * Handle framework errors with appropriate logging and fallback responses
 * @param {string} errorType - Type of error
 * @param {string} errorMessage - Error message
 * @param {string} sessionId - Session ID
 * @param {string} userInput - Original user input
 * @param {Object} config - Processing configuration
 * @returns {Object} Error response
 */
function handleFrameworkError(errorType, errorMessage, sessionId, userInput, config) {
  console.error(`Framework Error [${errorType}]:`, errorMessage);
  
  // Log error if enabled
  if (config.enableLogging) {
    const errorLogData = {
      sessionId: sessionId,
      userInput: userInput,
      errorType: errorType,
      errorMessage: errorMessage,
      timestamp: new Date(),
      userId: config.userId,
      channel: config.channel,
      success: false
    };
    
    try {
      // Attempt to log error (if logging is available)
      processFrameworkLogging(errorLogData, config.agentConfig || {});
    } catch (logError) {
      console.error('Error logging failed:', logError.message);
    }
  }
  
  // Generate fallback response
  const fallbackResponse = generateFallbackErrorResponse(errorType, errorMessage, userInput, config);
  
  return {
    success: false,
    sessionId: sessionId,
    error: errorMessage,
    errorType: errorType,
    response: fallbackResponse,
    userInput: userInput,
    processingTime: 0,
    metadata: {
      timestamp: new Date(),
      userId: config.userId,
      channel: config.channel
    }
  };
}

/**
 * Process Slack integration
 * @param {string} response - Response content to send
 * @param {Object} config - Processing configuration
 * @param {Object} agentConfig - Agent configuration
 * @returns {Object} Slack integration result
 */
function processSlackIntegration(response, config, agentConfig) {
  try {
    const credentials = getAgentCredentials(agentConfig.system.SYSTEM_NAME);
    if (!credentials.SLACK_BOT_TOKEN) {
      return {
        success: false,
        error: 'Slack bot token not configured'
      };
    }
    
    // Add user mention if enabled
    let finalResponse = response;
    if (config.userId && config.userId !== 'anonymous' && agentConfig.slack.MENTION_USERS) {
      finalResponse = `<@${config.userId}> ${response}`;
    }
    
    const slackPayload = {
      channel: config.channel,
      text: finalResponse,
      as_user: true
    };
    
    // Add thread support if configured
    if (config.threadTs && agentConfig.slack.ENABLE_THREADS) {
      slackPayload.thread_ts = config.threadTs;
    }
    
    const slackResponse = UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(slackPayload)
    });
    
    const slackData = JSON.parse(slackResponse.getContentText());
    
    if (slackData.ok) {
      return {
        success: true,
        messageTs: slackData.ts,
        channel: slackData.channel
      };
    } else {
      return {
        success: false,
        error: slackData.error || 'Unknown Slack API error'
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: `Slack integration failed: ${error.message}`
    };
  }
}

/**
 * Process webhook integration
 * @param {string} sessionId - Session ID
 * @param {string} userInput - User input
 * @param {Object} responseResult - Response result
 * @param {Object} config - Processing configuration
 * @param {Object} agentConfig - Agent configuration
 * @returns {Object} Webhook integration result
 */
function processWebhookIntegration(sessionId, userInput, responseResult, config, agentConfig) {
  try {
    const webhookUrls = agentConfig.webhooks.WEBHOOK_URLS || [];
    const results = [];
    
    const webhookPayload = {
      sessionId: sessionId,
      userInput: userInput,
      intent: responseResult.intent,
      response: responseResult.response,
      timestamp: new Date(),
      userId: config.userId,
      channel: config.channel,
      agentName: agentConfig.system.SYSTEM_NAME
    };
    
    for (const webhookUrl of webhookUrls) {
      try {
        const response = UrlFetchApp.fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          payload: JSON.stringify(webhookPayload),
          muteHttpExceptions: true
        });
        
        results.push({
          url: webhookUrl,
          success: response.getResponseCode() < 300,
          status: response.getResponseCode()
        });
        
      } catch (error) {
        results.push({
          url: webhookUrl,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      success: results.some(r => r.success),
      results: results
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Webhook integration failed: ${error.message}`
    };
  }
}

/**
 * Create comprehensive log data for framework execution
 * @param {string} sessionId - Session ID
 * @param {string} userInput - User input
 * @param {Object} inputParseResult - Input parsing result
 * @param {Object} searchResult - Search result
 * @param {Object} responseResult - Response generation result
 * @param {Object} integrationResults - Integration results
 * @param {Object} config - Processing configuration
 * @param {number} startTime - Processing start time
 * @returns {Object} Log data
 */
function createFrameworkLogData(sessionId, userInput, inputParseResult, searchResult, responseResult, integrationResults, config, startTime) {
  return {
    sessionId: sessionId,
    userInput: userInput,
    intent: inputParseResult.intent,
    parameters: inputParseResult.parameters,
    confidence: inputParseResult.confidence,
    language: inputParseResult.language,
    searchResultCount: searchResult.totalCount,
    responseType: responseResult.responseType,
    response: responseResult.response,
    integrations: integrationResults,
    processingTime: Date.now() - startTime,
    success: true,
    userId: config.userId,
    channel: config.channel,
    timestamp: new Date(),
    metadata: {
      inputParsingTime: inputParseResult.processingTime,
      contentRetrievalTime: searchResult.processingTime,
      responseGenerationTime: responseResult.processingTime
    }
  };
}

/**
 * Process framework logging
 * @param {Object} logData - Data to log
 * @param {Object} agentConfig - Agent configuration
 * @returns {Object} Logging result
 */
function processFrameworkLogging(logData, agentConfig) {
  try {
    const credentials = getAgentCredentials(agentConfig.system.SYSTEM_NAME);
    if (!credentials.SHEET_ID || !agentConfig.sheets.ENABLE_SHEETS) {
      console.log('Sheets logging not configured, logging to console only');
      console.log('Log data:', JSON.stringify(logData, null, 2));
      return { success: true, method: 'console' };
    }
    
    // Write to Google Sheets (implementation would depend on sheets utility)
    const sheetResult = writeFrameworkLogToSheet(logData, credentials.SHEET_ID, agentConfig);
    
    return {
      success: sheetResult.success,
      method: 'sheets',
      error: sheetResult.error
    };
    
  } catch (error) {
    console.error('Framework logging error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Write log data to Google Sheets
 * @param {Object} logData - Data to log
 * @param {string} sheetId - Google Sheets ID
 * @param {Object} agentConfig - Agent configuration
 * @returns {Object} Write result
 */
function writeFrameworkLogToSheet(logData, sheetId, agentConfig) {
  try {
    const sheet = SpreadsheetApp.openById(sheetId);
    const logSheetName = agentConfig.sheets.LOG_SHEET_NAME || 'Framework_Logs';
    
    let logSheet;
    try {
      logSheet = sheet.getSheetByName(logSheetName);
    } catch (error) {
      // Create sheet if it doesn't exist
      logSheet = sheet.insertSheet(logSheetName);
      
      // Add headers
      const headers = [
        'Timestamp', 'Session ID', 'User ID', 'Channel', 'User Input',
        'Intent', 'Parameters', 'Confidence', 'Language',
        'Search Results', 'Response Type', 'Response', 'Processing Time',
        'Success', 'Error Type', 'Error Message', 'Integrations'
      ];
      logSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    const row = [
      logData.timestamp,
      logData.sessionId,
      logData.userId,
      logData.channel,
      logData.userInput,
      logData.intent || '',
      JSON.stringify(logData.parameters || {}),
      logData.confidence || '',
      logData.language || '',
      logData.searchResultCount || 0,
      logData.responseType || '',
      logData.response || '',
      logData.processingTime || 0,
      logData.success,
      logData.errorType || '',
      logData.errorMessage || '',
      JSON.stringify(logData.integrations || {})
    ];
    
    logSheet.appendRow(row);
    
    return { success: true };
    
  } catch (error) {
    console.error('Sheet logging error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate fallback error response
 * @param {string} errorType - Error type
 * @param {string} errorMessage - Error message
 * @param {string} userInput - User input
 * @param {Object} config - Configuration
 * @returns {string} Fallback response
 */
function generateFallbackErrorResponse(errorType, errorMessage, userInput, config) {
  const agentName = config.agentConfig?.system?.SYSTEM_NAME || 'AI Agent';
  
  if (config.agentConfig?.errorHandling?.RETURN_TECHNICAL_ERRORS) {
    return `🤖 ${agentName}: I encountered an error processing your request: "${userInput}"\n\nError: ${errorType} - ${errorMessage}\n\nPlease try asking differently or contact support.`;
  } else {
    return `🤖 ${agentName}: I encountered an issue processing your request: "${userInput}"\n\nPlease try asking for help or rephrase your question.`;
  }
}

/**
 * Generate framework session ID
 * @returns {string} Session ID
 */
function generateFrameworkSessionId() {
  return `fw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate framework inputs
 * @param {string} userInput - User input
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} intentDefinitions - Intent definitions
 * @param {Object} dataProvider - Data provider
 * @param {Object} responseTemplates - Response templates
 * @returns {Object} Validation result
 */
function validateFrameworkInputs(userInput, agentConfig, intentDefinitions, dataProvider, responseTemplates) {
  const errors = [];
  
  if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
    errors.push('User input is required and must be a non-empty string');
  }
  
  if (!agentConfig || typeof agentConfig !== 'object') {
    errors.push('Agent configuration is required');
  }
  
  if (!intentDefinitions || typeof intentDefinitions !== 'object') {
    errors.push('Intent definitions are required');
  }
  
  if (!dataProvider || typeof dataProvider.loadData !== 'function') {
    errors.push('Data provider must implement loadData function');
  }
  
  if (!responseTemplates || typeof responseTemplates !== 'object') {
    errors.push('Response templates are required');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
} 