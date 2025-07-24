/**
 * AI Agent Framework - Response Generator Agent
 * Generic response generation agent with configurable templates
 */

/**
 * Main function of Response Generator Agent
 * @param {string} intent - User intent
 * @param {Object} parameters - Parsed parameters
 * @param {Array} searchResults - Search results from content retriever
 * @param {string} originalInput - Original user input
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} responseTemplates - Response templates configuration
 * @returns {Object} Response generation result
 */
function processResponseGeneration(intent, parameters, searchResults, originalInput, agentConfig, responseTemplates) {
  console.log('FrameworkResponseGenerator started:', intent);
  
  const startTime = Date.now();
  
  try {
    // Validate inputs
    const validation = validateResponseInputs(intent, parameters, agentConfig, responseTemplates);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        processingTime: Date.now() - startTime
      };
    }
    
    // Determine response type based on results and intent
    const responseType = determineResponseType(intent, searchResults, agentConfig);
    
    // Generate appropriate response
    let response;
    switch (responseType) {
      case 'results_found':
        response = generateResultsResponse(intent, parameters, searchResults, agentConfig, responseTemplates);
        break;
      case 'no_results':
        response = generateNoResultsResponse(intent, parameters, originalInput, agentConfig, responseTemplates);
        break;
      case 'help':
        response = generateHelpResponse(agentConfig, responseTemplates);
        break;
      case 'error':
        response = generateErrorResponse(intent, parameters, originalInput, agentConfig, responseTemplates);
        break;
      default:
        response = generateFallbackResponse(originalInput, agentConfig, responseTemplates);
    }
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        processingTime: Date.now() - startTime
      };
    }
    
    // Apply formatting based on integration platform
    const formattedResponse = applyPlatformFormatting(response.content, agentConfig);
    
    console.log('FrameworkResponseGenerator completed');
    
    return {
      success: true,
      response: formattedResponse,
      responseType: responseType,
      resultCount: searchResults ? searchResults.length : 0,
      processingTime: Date.now() - startTime
    };
    
  } catch (error) {
    console.error('FrameworkResponseGenerator error:', error.message);
    return {
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Determine appropriate response type
 * @param {string} intent - User intent
 * @param {Array} searchResults - Search results
 * @param {Object} agentConfig - Agent configuration
 * @returns {string} Response type
 */
function determineResponseType(intent, searchResults, agentConfig) {
  if (intent === 'help' || intent === 'get_help') {
    return 'help';
  }
  
  if (!searchResults || searchResults.length === 0) {
    return 'no_results';
  }
  
  if (searchResults.length > 0) {
    return 'results_found';
  }
  
  return 'fallback';
}

/**
 * Generate response for successful search results
 * @param {string} intent - User intent
 * @param {Object} parameters - Search parameters
 * @param {Array} searchResults - Search results
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} responseTemplates - Response templates
 * @returns {Object} Response generation result
 */
function generateResultsResponse(intent, parameters, searchResults, agentConfig, responseTemplates) {
  try {
    // Determine response language
    const responseLanguage = parameters.language || agentConfig.system.DEFAULT_LANGUAGE;
    
    // Get appropriate template
    const template = getResponseTemplate('results_found', responseLanguage, responseTemplates);
    
    // Use AI to generate natural response if enabled
    if (agentConfig.openai.USE_AI_RESPONSES) {
      return generateAIResponse(intent, parameters, searchResults, agentConfig, template);
    } else {
      return generateTemplateResponse(searchResults, template, agentConfig);
    }
    
  } catch (error) {
    return {
      success: false,
      error: `Results response generation failed: ${error.message}`
    };
  }
}

/**
 * Generate AI-powered natural response
 * @param {string} intent - User intent
 * @param {Object} parameters - Search parameters
 * @param {Array} searchResults - Search results
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} template - Response template
 * @returns {Object} AI response result
 */
function generateAIResponse(intent, parameters, searchResults, agentConfig, template) {
  try {
    const credentials = getAgentCredentials(agentConfig.system.SYSTEM_NAME);
    if (!credentials.OPENAI_API_KEY) {
      return generateTemplateResponse(searchResults, template, agentConfig);
    }
    
    // Build system prompt for response generation
    const systemPrompt = buildResponseSystemPrompt(agentConfig, template);
    
    // Prepare context for AI
    const context = {
      intent: intent,
      parameters: parameters,
      results: searchResults.slice(0, 5), // Limit for token usage
      resultCount: searchResults.length
    };
    
    const userPrompt = `Generate a response for the following context:\n${JSON.stringify(context)}`;
    
    const requestPayload = {
      model: agentConfig.openai.MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
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
      console.warn('OpenAI error, falling back to template:', responseData.error.message);
      return generateTemplateResponse(searchResults, template, agentConfig);
    }
    
    if (!responseData.choices || responseData.choices.length === 0) {
      return generateTemplateResponse(searchResults, template, agentConfig);
    }
    
    const aiResponse = responseData.choices[0].message.content;
    
    return {
      success: true,
      content: aiResponse
    };
    
  } catch (error) {
    console.warn('AI response generation failed, using template:', error.message);
    return generateTemplateResponse(searchResults, template, agentConfig);
  }
}

/**
 * Generate template-based response
 * @param {Array} searchResults - Search results
 * @param {Object} template - Response template
 * @param {Object} agentConfig - Agent configuration
 * @returns {Object} Template response result
 */
function generateTemplateResponse(searchResults, template, agentConfig) {
  try {
    const maxResults = agentConfig.maxDisplayResults || 10;
    const displayResults = searchResults.slice(0, maxResults);
    
    let response = template.header || '';
    
    // Add results
    displayResults.forEach((result, index) => {
      const resultText = formatSingleResult(result, template.resultFormat, index + 1);
      response += resultText;
    });
    
    // Add footer if there are more results
    if (searchResults.length > maxResults) {
      const remainingCount = searchResults.length - maxResults;
      response += template.footer?.replace('{remaining}', remainingCount) || '';
    }
    
    return {
      success: true,
      content: response
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Template response generation failed: ${error.message}`
    };
  }
}

/**
 * Format a single result using template
 * @param {Object} result - Individual result
 * @param {string} format - Format template
 * @param {number} index - Result index
 * @returns {string} Formatted result
 */
function formatSingleResult(result, format, index) {
  let formatted = format || `• {title}\n  {description}\n`;
  
  // Replace placeholders
  formatted = formatted.replace('{index}', index);
  formatted = formatted.replace('{title}', result.title || 'Untitled');
  formatted = formatted.replace('{description}', result.description || 'No description');
  formatted = formatted.replace('{category}', result.category || '');
  formatted = formatted.replace('{tags}', Array.isArray(result.tags) ? result.tags.join(', ') : result.tags || '');
  formatted = formatted.replace('{duration}', result.duration || '');
  formatted = formatted.replace('{level}', result.level || '');
  formatted = formatted.replace('{type}', result.type || '');
  
  // Handle custom fields
  for (const [key, value] of Object.entries(result)) {
    if (key.startsWith('custom_')) {
      formatted = formatted.replace(`{${key}}`, value || '');
    }
  }
  
  return formatted;
}

/**
 * Generate no results response
 * @param {string} intent - User intent
 * @param {Object} parameters - Search parameters
 * @param {string} originalInput - Original user input
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} responseTemplates - Response templates
 * @returns {Object} No results response
 */
function generateNoResultsResponse(intent, parameters, originalInput, agentConfig, responseTemplates) {
  try {
    const responseLanguage = parameters.language || agentConfig.system.DEFAULT_LANGUAGE;
    const template = getResponseTemplate('no_results', responseLanguage, responseTemplates);
    
    let response = template.message || 'No results found.';
    response = response.replace('{query}', originalInput);
    response = response.replace('{intent}', intent);
    
    if (template.suggestions && template.suggestions.length > 0) {
      response += '\n\n' + template.suggestionsHeader + '\n';
      template.suggestions.forEach(suggestion => {
        response += `${template.suggestionFormat.replace('{suggestion}', suggestion)}\n`;
      });
    }
    
    return {
      success: true,
      content: response
    };
    
  } catch (error) {
    return {
      success: false,
      error: `No results response generation failed: ${error.message}`
    };
  }
}

/**
 * Generate help response
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} responseTemplates - Response templates
 * @returns {Object} Help response
 */
function generateHelpResponse(agentConfig, responseTemplates) {
  try {
    const template = getResponseTemplate('help', agentConfig.system.DEFAULT_LANGUAGE, responseTemplates);
    
    let response = template.message || 'Help information:';
    response = response.replace('{agentName}', agentConfig.system.SYSTEM_NAME);
    response = response.replace('{description}', agentConfig.system.AGENT_DESCRIPTION);
    
    if (template.examples && template.examples.length > 0) {
      response += '\n\n' + (template.examplesHeader || 'Examples:') + '\n';
      template.examples.forEach(example => {
        response += `${template.exampleFormat.replace('{example}', example)}\n`;
      });
    }
    
    return {
      success: true,
      content: response
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Help response generation failed: ${error.message}`
    };
  }
}

/**
 * Generate error response
 * @param {string} intent - User intent
 * @param {Object} parameters - Search parameters
 * @param {string} originalInput - Original user input
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} responseTemplates - Response templates
 * @returns {Object} Error response
 */
function generateErrorResponse(intent, parameters, originalInput, agentConfig, responseTemplates) {
  try {
    const responseLanguage = parameters.language || agentConfig.system.DEFAULT_LANGUAGE;
    const template = getResponseTemplate('error', responseLanguage, responseTemplates);
    
    let response = template.message || 'An error occurred while processing your request.';
    response = response.replace('{query}', originalInput);
    response = response.replace('{agentName}', agentConfig.system.SYSTEM_NAME);
    
    return {
      success: true,
      content: response
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Error response generation failed: ${error.message}`
    };
  }
}

/**
 * Generate fallback response
 * @param {string} originalInput - Original user input
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} responseTemplates - Response templates
 * @returns {Object} Fallback response
 */
function generateFallbackResponse(originalInput, agentConfig, responseTemplates) {
  try {
    const template = getResponseTemplate('fallback', agentConfig.system.DEFAULT_LANGUAGE, responseTemplates);
    
    let response = template.message || 'I\'m not sure how to help with that request.';
    response = response.replace('{query}', originalInput);
    response = response.replace('{agentName}', agentConfig.system.SYSTEM_NAME);
    
    return {
      success: true,
      content: response
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Fallback response generation failed: ${error.message}`
    };
  }
}

/**
 * Get response template for specific type and language
 * @param {string} responseType - Type of response
 * @param {string} language - Response language
 * @param {Object} responseTemplates - All response templates
 * @returns {Object} Response template
 */
function getResponseTemplate(responseType, language, responseTemplates) {
  const templates = responseTemplates[language] || responseTemplates['english'] || {};
  return templates[responseType] || responseTemplates.default[responseType] || {};
}

/**
 * Build system prompt for AI response generation
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} template - Response template
 * @returns {string} System prompt
 */
function buildResponseSystemPrompt(agentConfig, template) {
  const agentName = agentConfig.system.SYSTEM_NAME;
  const description = agentConfig.system.AGENT_DESCRIPTION;
  
  return `You are ${agentName}, ${description}.

Generate helpful and informative responses based on the provided search results.

Guidelines:
- Be concise but informative
- Use appropriate formatting for the platform
- Include relevant details from the search results
- Maintain a helpful and professional tone
- Use the response template style: ${JSON.stringify(template)}

Return only the response content, no additional formatting.`;
}

/**
 * Apply platform-specific formatting
 * @param {string} response - Raw response content
 * @param {Object} agentConfig - Agent configuration
 * @returns {string} Formatted response
 */
function applyPlatformFormatting(response, agentConfig) {
  if (agentConfig.slack && agentConfig.slack.ENABLE_SLACK) {
    // Apply Slack-specific formatting
    return response.replace(/\*\*(.*?)\*\*/g, '*$1*'); // Convert **bold** to *bold*
  }
  
  return response;
}

/**
 * Validate response generation inputs
 * @param {string} intent - User intent
 * @param {Object} parameters - Search parameters
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} responseTemplates - Response templates
 * @returns {Object} Validation result
 */
function validateResponseInputs(intent, parameters, agentConfig, responseTemplates) {
  const errors = [];
  
  if (!intent || typeof intent !== 'string') {
    errors.push('Intent is required and must be a string');
  }
  
  if (!parameters || typeof parameters !== 'object') {
    errors.push('Parameters must be an object');
  }
  
  if (!agentConfig) {
    errors.push('Agent configuration is required');
  }
  
  if (!responseTemplates || typeof responseTemplates !== 'object') {
    errors.push('Response templates are required');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
} 