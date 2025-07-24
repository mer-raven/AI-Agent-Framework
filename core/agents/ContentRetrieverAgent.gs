/**
 * AI Agent Framework - Content Retriever Agent
 * Generic content retrieval agent with pluggable data sources
 */

/**
 * Main function of Content Retriever Agent
 * @param {string} intent - User intent
 * @param {Object} parameters - Parsed parameters
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} dataProvider - Data provider implementation
 * @returns {Object} Search result
 */
function processContentRetrieval(intent, parameters, agentConfig, dataProvider) {
  console.log(`FrameworkContentRetriever started: ${intent}`, JSON.stringify(parameters));
  
  const startTime = Date.now();
  
  try {
    // Validate inputs
    const validation = validateRetrievalInputs(intent, parameters, agentConfig, dataProvider);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        processingTime: Date.now() - startTime
      };
    }
    
    // Load data using the provided data provider
    const dataResult = dataProvider.loadData(agentConfig);
    if (!dataResult.success) {
      return {
        success: false,
        error: `Data loading failed: ${dataResult.error}`,
        processingTime: Date.now() - startTime
      };
    }
    
    console.log(`Loaded data: ${dataResult.data.length} items`);
    
    // Execute search based on intent
    const searchResult = executeIntentBasedSearch(intent, parameters, dataResult.data, agentConfig);
    
    if (!searchResult.success) {
      return {
        success: false,
        error: searchResult.error,
        processingTime: Date.now() - startTime
      };
    }
    
    // Process and format results
    const processedResults = processSearchResults(searchResult.results, agentConfig);
    
    console.log(`FrameworkContentRetriever completed: ${processedResults.length} results found`);
    
    return {
      success: true,
      results: processedResults,
      totalCount: processedResults.length,
      intent: intent,
      parameters: parameters,
      processingTime: Date.now() - startTime
    };
    
  } catch (error) {
    console.error('FrameworkContentRetriever error:', error.message);
    return {
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Execute search based on intent and parameters
 * @param {string} intent - User intent
 * @param {Object} parameters - Search parameters
 * @param {Array} data - Data to search through
 * @param {Object} agentConfig - Agent configuration
 * @returns {Object} Search result
 */
function executeIntentBasedSearch(intent, parameters, data, agentConfig) {
  try {
    let results = [...data];
    
    // Apply filters based on intent and parameters
    if (parameters.category) {
      results = filterByCategory(results, parameters.category, agentConfig);
    }
    
    if (parameters.role) {
      results = filterByRole(results, parameters.role, agentConfig);
    }
    
    if (parameters.keywords && parameters.keywords.length > 0) {
      results = filterByKeywords(results, parameters.keywords, agentConfig);
    }
    
    if (parameters.level) {
      results = filterByLevel(results, parameters.level, agentConfig);
    }
    
    if (parameters.type) {
      results = filterByType(results, parameters.type, agentConfig);
    }
    
    // Apply sorting if configured
    if (agentConfig.processing.ENABLE_SORTING) {
      results = sortResults(results, parameters, agentConfig);
    }
    
    // Apply limit if specified
    if (parameters.limit && parameters.limit > 0) {
      results = results.slice(0, parameters.limit);
    }
    
    return {
      success: true,
      results: results
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Search execution failed: ${error.message}`
    };
  }
}

/**
 * Filter results by category
 * @param {Array} results - Current results
 * @param {string} category - Category to filter by
 * @param {Object} agentConfig - Agent configuration
 * @returns {Array} Filtered results
 */
function filterByCategory(results, category, agentConfig) {
  const searchCategory = category.toLowerCase();
  
  return results.filter(item => {
    if (item.category && item.category.toLowerCase() === searchCategory) {
      return true;
    }
    
    // Check category aliases if configured
    if (agentConfig.categoryAliases && agentConfig.categoryAliases[searchCategory]) {
      const aliases = agentConfig.categoryAliases[searchCategory];
      return aliases.some(alias => 
        item.category && item.category.toLowerCase() === alias.toLowerCase()
      );
    }
    
    return false;
  });
}

/**
 * Filter results by role
 * @param {Array} results - Current results
 * @param {string} role - Role to filter by
 * @param {Object} agentConfig - Agent configuration
 * @returns {Array} Filtered results
 */
function filterByRole(results, role, agentConfig) {
  const searchRole = role.toLowerCase();
  
  return results.filter(item => {
    // Check direct role match
    if (item.role && item.role.toLowerCase().includes(searchRole)) {
      return true;
    }
    
    // Check role aliases if configured
    if (agentConfig.roleAliases && agentConfig.roleAliases[searchRole]) {
      const aliases = agentConfig.roleAliases[searchRole];
      return aliases.some(alias => 
        item.role && item.role.toLowerCase().includes(alias.toLowerCase())
      );
    }
    
    // Check in other fields if configured
    const searchFields = agentConfig.roleSearchFields || ['title', 'description', 'tags'];
    return searchFields.some(field => 
      item[field] && item[field].toLowerCase().includes(searchRole)
    );
  });
}

/**
 * Filter results by keywords
 * @param {Array} results - Current results
 * @param {Array} keywords - Keywords to search for
 * @param {Object} agentConfig - Agent configuration
 * @returns {Array} Filtered results
 */
function filterByKeywords(results, keywords, agentConfig) {
  // Get generic keywords to exclude if specified
  const genericKeywords = agentConfig.genericKeywords || [];
  
  // Filter out generic keywords
  const meaningfulKeywords = keywords.filter(keyword =>
    !genericKeywords.includes(keyword.toLowerCase())
  );
  
  // If no meaningful keywords remain, return all results
  if (meaningfulKeywords.length === 0) {
    console.log('Keyword filter: Skipped (only generic keywords)');
    return results;
  }
  
  const searchFields = agentConfig.keywordSearchFields || ['title', 'description', 'tags'];
  
  return results.filter(item => {
    return meaningfulKeywords.some(keyword => {
      const searchTerm = keyword.toLowerCase();
      return searchFields.some(field => {
        if (item[field]) {
          const fieldValue = Array.isArray(item[field]) 
            ? item[field].join(' ').toLowerCase()
            : item[field].toLowerCase();
          return fieldValue.includes(searchTerm);
        }
        return false;
      });
    });
  });
}

/**
 * Filter results by level
 * @param {Array} results - Current results
 * @param {string} level - Level to filter by
 * @param {Object} agentConfig - Agent configuration
 * @returns {Array} Filtered results
 */
function filterByLevel(results, level, agentConfig) {
  const searchLevel = level.toLowerCase();
  
  return results.filter(item => {
    if (item.level && item.level.toLowerCase() === searchLevel) {
      return true;
    }
    
    // Check level mapping if configured
    if (agentConfig.levelMapping) {
      const mappedLevels = agentConfig.levelMapping[searchLevel] || [];
      return mappedLevels.some(mappedLevel => 
        item.level && item.level.toLowerCase() === mappedLevel.toLowerCase()
      );
    }
    
    return false;
  });
}

/**
 * Filter results by type
 * @param {Array} results - Current results
 * @param {string} type - Type to filter by
 * @param {Object} agentConfig - Agent configuration
 * @returns {Array} Filtered results
 */
function filterByType(results, type, agentConfig) {
  const searchType = type.toLowerCase();
  
  return results.filter(item => {
    const typeFields = agentConfig.typeSearchFields || ['type', 'format', 'tags'];
    return typeFields.some(field => {
      if (item[field]) {
        const fieldValue = Array.isArray(item[field])
          ? item[field].join(' ').toLowerCase()
          : item[field].toLowerCase();
        return fieldValue.includes(searchType);
      }
      return false;
    });
  });
}

/**
 * Sort results based on parameters and configuration
 * @param {Array} results - Results to sort
 * @param {Object} parameters - Search parameters
 * @param {Object} agentConfig - Agent configuration
 * @returns {Array} Sorted results
 */
function sortResults(results, parameters, agentConfig) {
  const sortField = parameters.sortBy || agentConfig.defaultSortField || 'title';
  const sortOrder = parameters.sortOrder || agentConfig.defaultSortOrder || 'asc';
  
  return results.sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (sortOrder === 'desc') {
      return bValue.localeCompare(aValue);
    } else {
      return aValue.localeCompare(bValue);
    }
  });
}

/**
 * Process and format search results
 * @param {Array} results - Raw search results
 * @param {Object} agentConfig - Agent configuration
 * @returns {Array} Processed results
 */
function processSearchResults(results, agentConfig) {
  return results.map(item => {
    const processed = { ...item };
    
    // Ensure required fields exist
    if (!processed.title) processed.title = 'Untitled';
    if (!processed.description) processed.description = 'No description available';
    
    // Handle tags array
    if (processed.tags && !Array.isArray(processed.tags)) {
      processed.tags = processed.tags.split(',').map(tag => tag.trim());
    }
    
    // Add metadata if configured
    if (agentConfig.addMetadata) {
      processed._metadata = {
        retrievedAt: new Date(),
        source: agentConfig.system.SYSTEM_NAME
      };
    }
    
    return processed;
  });
}

/**
 * Validate retrieval inputs
 * @param {string} intent - User intent
 * @param {Object} parameters - Search parameters
 * @param {Object} agentConfig - Agent configuration
 * @param {Object} dataProvider - Data provider
 * @returns {Object} Validation result
 */
function validateRetrievalInputs(intent, parameters, agentConfig, dataProvider) {
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
  
  if (!dataProvider || typeof dataProvider.loadData !== 'function') {
    errors.push('Data provider must implement loadData function');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
} 