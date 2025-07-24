/**
 * AI Agent Framework - Input Parser Agent
 * Generic intent classification and parameter extraction agent
 */

/**
 * Main function of Input Parser Agent
 * @param {string} userInput - User input text
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} intentDefinitions - Intent definitions for this agent
 * @returns {Object} Parse result
 */
function processInputParsing(userInput, agentConfig, intentDefinitions) {
  console.log('FrameworkInputParser started:', userInput);
  
  const startTime = Date.now();
  
  try {
    // Input validation
    const validation = validateInputData(userInput, agentConfig);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        processingTime: Date.now() - startTime
      };
    }
    
    // Parse intent using configurable system prompt
    const result = parseUserIntentWithConfig(userInput, agentConfig, intentDefinitions);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        processingTime: Date.now() - startTime
      };
    }
    
    // Parse and validate result
    const parsedResult = safeJsonParse(result.content);
    if (!parsedResult) {
      return {
        success: false,
        error: 'Failed to parse AI response',
        processingTime: Date.now() - startTime
      };
    }
    
    // Validate against intent definitions
    const resultValidation = validateParsedResultAgainstIntents(parsedResult, intentDefinitions);
    if (!resultValidation.valid) {
      return {
        success: false,
        error: resultValidation.errors.join(', '),
        processingTime: Date.now() - startTime
      };
    }
    
    console.log('FrameworkInputParser completed:', parsedResult.intent);
    
    return {
      success: true,
      intent: parsedResult.intent,
      parameters: parsedResult.parameters || {},
      confidence: parsedResult.confidence || 0.8,
      language: parsedResult.language || agentConfig.system.DEFAULT_LANGUAGE,
      processingTime: Date.now() - startTime
    };
    
  } catch (error) {
    console.error('FrameworkInputParser error:', error.message);
    return {
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Parse user intent using configurable OpenAI system prompt
 * @param {string} userInput - User input text
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} intentDefinitions - Intent definitions
 * @returns {Object} OpenAI API result
 */
function parseUserIntentWithConfig(userInput, agentConfig, intentDefinitions) {
  try {
    // Build system prompt from configuration
    const systemPrompt = buildSystemPrompt(agentConfig, intentDefinitions);
    
    const credentials = getAgentCredentials(agentConfig.system.SYSTEM_NAME);
    if (!credentials.OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OpenAI API key not configured'
      };
    }
    
    const requestPayload = {
      model: agentConfig.openai.MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput }
      ],
      max_tokens: agentConfig.openai.MAX_TOKENS,
      temperature: agentConfig.openai.TEMPERATURE
    };
    
    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(requestPayload)
    });
    
    const responseData = JSON.parse(response.getContentText());
    
    if (responseData.error) {
      return {
        success: false,
        error: `OpenAI API error: ${responseData.error.message}`
      };
    }
    
    if (!responseData.choices || responseData.choices.length === 0) {
      return {
        success: false,
        error: 'No response from OpenAI API'
      };
    }
    
    return {
      success: true,
      content: responseData.choices[0].message.content
    };
    
  } catch (error) {
    return {
      success: false,
      error: `OpenAI API request failed: ${error.message}`
    };
  }
}

/**
 * Build system prompt from configuration and intent definitions
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} intentDefinitions - Intent definitions
 * @returns {string} System prompt
 */
function buildSystemPrompt(agentConfig, intentDefinitions) {
  const supportedLanguages = agentConfig.system.SUPPORTED_LANGUAGES.join(' and ');
  const agentDescription = agentConfig.system.AGENT_DESCRIPTION;
  
  let prompt = `You are an intent classification system for ${agentDescription} that supports ${supportedLanguages}.

Your task is to analyze user input and extract:
1. Intent: The main action the user wants to perform
2. Parameters: Relevant filters and criteria
3. Confidence: Your confidence level (0.0-1.0)
4. Language: Detected input language for response generation

IMPORTANT: Ignore conversational phrases and focus on the core request.
`;

  // Add language-specific phrases to ignore
  if (agentConfig.system.SUPPORTED_LANGUAGES.includes('english')) {
    prompt += `English phrases to ignore: "let me know", "tell me about", "show me", "can you", "please", "I want to", "I need", etc.\n`;
  }
  
  if (agentConfig.system.SUPPORTED_LANGUAGES.includes('japanese')) {
    prompt += `Japanese phrases to ignore: "教えてください", "見せてください", "知りたい", "お願いします", "について", "全て", "すべて", etc.\n`;
  }
  
  // Add context handling instructions
  prompt += `
CONTEXT HANDLING: If input contains "Context:" followed by "User follow-up:", analyze both parts:
1. Extract the main topic from the Context section
2. Interpret the User follow-up in relation to the Context
3. Generate appropriate intent and parameters based on the combined understanding

`;

  // Add available intents
  prompt += `Available intents:\n`;
  for (const [intentName, intentConfig] of Object.entries(intentDefinitions)) {
    prompt += `- ${intentName}: ${intentConfig.description}\n`;
    if (intentConfig.parameters) {
      prompt += `  Parameters: ${intentConfig.parameters.join(', ')}\n`;
    }
  }
  
  // Add examples if available
  if (intentDefinitions.examples) {
    prompt += `\nExamples:\n`;
    for (const example of intentDefinitions.examples) {
      prompt += `Input: "${example.input}"\n`;
      prompt += `Output: ${JSON.stringify(example.output)}\n\n`;
    }
  }
  
  prompt += `
Return your response as a JSON object with this exact structure:
{
  "intent": "intent_name",
  "parameters": { /* extracted parameters */ },
  "confidence": 0.8,
  "language": "english" or "japanese"
}`;
  
  return prompt;
}

/**
 * Validate input data
 * @param {string} userInput - User input
 * @param {Object} agentConfig - Agent configuration
 * @returns {Object} Validation result
 */
function validateInputData(userInput, agentConfig) {
  const errors = [];
  
  if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
    errors.push('User input is required and must be a non-empty string');
  }
  
  if (!agentConfig) {
    errors.push('Agent configuration is required');
  }
  
  if (userInput && userInput.length > 2000) {
    errors.push('User input too long (max 2000 characters)');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate parsed result against intent definitions
 * @param {Object} parsedResult - Parsed result from AI
 * @param {Object} intentDefinitions - Intent definitions
 * @returns {Object} Validation result
 */
function validateParsedResultAgainstIntents(parsedResult, intentDefinitions) {
  const errors = [];
  
  if (!parsedResult.intent) {
    errors.push('Intent is required');
  } else if (!intentDefinitions[parsedResult.intent]) {
    errors.push(`Unknown intent: ${parsedResult.intent}`);
  }
  
  if (parsedResult.confidence !== undefined && 
      (typeof parsedResult.confidence !== 'number' || 
       parsedResult.confidence < 0 || parsedResult.confidence > 1)) {
    errors.push('Confidence must be a number between 0 and 1');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Safe JSON parsing with error handling
 * @param {string} jsonString - JSON string to parse
 * @returns {Object|null} Parsed object or null if parsing fails
 */
function safeJsonParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parsing error:', error.message);
    return null;
  }
} 