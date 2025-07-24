/**
 * AI Agent Framework - Data Provider Interface
 * Defines the interface for pluggable data sources
 */

/**
 * Base Data Provider Interface
 * All data providers should implement this interface
 */
const IDataProvider = {
  /**
   * Load data from the data source
   * @param {Object} agentConfig - Agent configuration
   * @returns {Object} Result object with success status and data array
   */
  loadData: function(agentConfig) {
    throw new Error('loadData method must be implemented');
  },
  
  /**
   * Validate data structure (optional)
   * @param {Array} data - Data to validate
   * @returns {Object} Validation result
   */
  validateData: function(data) {
    return { valid: true, errors: [] };
  },
  
  /**
   * Get data source metadata (optional)
   * @returns {Object} Metadata about the data source
   */
  getMetadata: function() {
    return {
      name: 'Base Data Provider',
      version: '1.0.0',
      description: 'Base interface for data providers'
    };
  }
};

/**
 * Google Sheets Data Provider
 * Loads data from Google Sheets
 */
function createSheetsDataProvider() {
  return {
    loadData: function(agentConfig) {
      try {
        const credentials = getAgentCredentials(agentConfig.system.SYSTEM_NAME);
        if (!credentials.SHEET_ID) {
          return {
            success: false,
            error: 'Google Sheets ID not configured',
            data: []
          };
        }
        
        const sheet = SpreadsheetApp.openById(credentials.SHEET_ID);
        const dataSheetName = agentConfig.sheets.DATA_SHEET_NAME || 'Data';
        
        let dataSheet;
        try {
          dataSheet = sheet.getSheetByName(dataSheetName);
        } catch (error) {
          return {
            success: false,
            error: `Sheet "${dataSheetName}" not found`,
            data: []
          };
        }
        
        const range = dataSheet.getDataRange();
        const values = range.getValues();
        
        if (values.length <= 1) {
          return {
            success: true,
            data: [],
            metadata: { source: 'Google Sheets', sheetName: dataSheetName, rows: 0 }
          };
        }
        
        // First row contains headers
        const headers = values[0];
        const data = [];
        
        for (let i = 1; i < values.length; i++) {
          const row = values[i];
          const item = {};
          
          headers.forEach((header, index) => {
            if (header && row[index] !== undefined) {
              item[header.toLowerCase().replace(/\s+/g, '_')] = row[index];
            }
          });
          
          // Skip empty rows
          if (Object.keys(item).length > 0 && Object.values(item).some(val => val !== '')) {
            data.push(item);
          }
        }
        
        return {
          success: true,
          data: data,
          metadata: {
            source: 'Google Sheets',
            sheetName: dataSheetName,
            rows: data.length,
            lastUpdated: new Date()
          }
        };
        
      } catch (error) {
        return {
          success: false,
          error: `Sheets data loading failed: ${error.message}`,
          data: []
        };
      }
    },
    
    validateData: function(data) {
      const errors = [];
      const requiredFields = ['title'];
      
      data.forEach((item, index) => {
        requiredFields.forEach(field => {
          if (!item[field]) {
            errors.push(`Row ${index + 1}: Missing required field "${field}"`);
          }
        });
      });
      
      return {
        valid: errors.length === 0,
        errors: errors
      };
    },
    
    getMetadata: function() {
      return {
        name: 'Google Sheets Data Provider',
        version: '1.0.0',
        description: 'Loads data from Google Sheets',
        supportedFields: ['title', 'description', 'category', 'tags', 'level', 'type', 'duration']
      };
    }
  };
}

/**
 * JSON Data Provider
 * Loads data from a predefined JSON structure
 */
function createJSONDataProvider(jsonData) {
  return {
    loadData: function(agentConfig) {
      try {
        if (!jsonData || !Array.isArray(jsonData)) {
          return {
            success: false,
            error: 'Invalid JSON data provided',
            data: []
          };
        }
        
        return {
          success: true,
          data: jsonData,
          metadata: {
            source: 'JSON',
            rows: jsonData.length,
            lastUpdated: new Date()
          }
        };
        
      } catch (error) {
        return {
          success: false,
          error: `JSON data loading failed: ${error.message}`,
          data: []
        };
      }
    },
    
    validateData: function(data) {
      const errors = [];
      
      if (!Array.isArray(data)) {
        errors.push('Data must be an array');
        return { valid: false, errors: errors };
      }
      
      data.forEach((item, index) => {
        if (!item.title) {
          errors.push(`Item ${index}: Missing title field`);
        }
      });
      
      return {
        valid: errors.length === 0,
        errors: errors
      };
    },
    
    getMetadata: function() {
      return {
        name: 'JSON Data Provider',
        version: '1.0.0',
        description: 'Loads data from predefined JSON structure'
      };
    }
  };
}

/**
 * REST API Data Provider
 * Loads data from a REST API endpoint
 */
function createAPIDataProvider(apiUrl, apiConfig = {}) {
  return {
    loadData: function(agentConfig) {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...apiConfig.headers
        };
        
        // Add authentication if configured
        const credentials = getAgentCredentials(agentConfig.system.SYSTEM_NAME);
        if (apiConfig.authType === 'bearer' && credentials.API_TOKEN) {
          headers['Authorization'] = `Bearer ${credentials.API_TOKEN}`;
        } else if (apiConfig.authType === 'api_key' && credentials.API_KEY) {
          headers[apiConfig.apiKeyHeader || 'X-API-Key'] = credentials.API_KEY;
        }
        
        const response = UrlFetchApp.fetch(apiUrl, {
          method: apiConfig.method || 'GET',
          headers: headers,
          muteHttpExceptions: true
        });
        
        if (response.getResponseCode() >= 400) {
          return {
            success: false,
            error: `API request failed with status ${response.getResponseCode()}`,
            data: []
          };
        }
        
        const responseData = JSON.parse(response.getContentText());
        
        // Extract data from response based on configuration
        let data = responseData;
        if (apiConfig.dataPath) {
          const pathParts = apiConfig.dataPath.split('.');
          for (const part of pathParts) {
            data = data[part];
            if (!data) break;
          }
        }
        
        if (!Array.isArray(data)) {
          return {
            success: false,
            error: 'API response does not contain an array of data',
            data: []
          };
        }
        
        return {
          success: true,
          data: data,
          metadata: {
            source: 'REST API',
            url: apiUrl,
            rows: data.length,
            lastUpdated: new Date()
          }
        };
        
      } catch (error) {
        return {
          success: false,
          error: `API data loading failed: ${error.message}`,
          data: []
        };
      }
    },
    
    validateData: function(data) {
      const errors = [];
      
      if (!Array.isArray(data)) {
        errors.push('Data must be an array');
        return { valid: false, errors: errors };
      }
      
      return {
        valid: true,
        errors: errors
      };
    },
    
    getMetadata: function() {
      return {
        name: 'REST API Data Provider',
        version: '1.0.0',
        description: `Loads data from REST API: ${apiUrl}`
      };
    }
  };
}

/**
 * Mock Data Provider
 * Provides sample data for testing and development
 */
function createMockDataProvider() {
  const mockData = [
    {
      title: 'Introduction to Programming',
      description: 'Learn the basics of programming with hands-on examples',
      category: 'Programming',
      tags: ['beginner', 'programming', 'tutorial'],
      level: 'beginner',
      type: 'video',
      duration: '60min'
    },
    {
      title: 'Advanced JavaScript Techniques',
      description: 'Master advanced JavaScript concepts and patterns',
      category: 'Development',
      tags: ['javascript', 'advanced', 'web'],
      level: 'advanced',
      type: 'course',
      duration: '180min'
    },
    {
      title: 'Project Management Fundamentals',
      description: 'Essential project management skills for leaders',
      category: 'Management',
      tags: ['management', 'leadership', 'skills'],
      level: 'intermediate',
      type: 'workshop',
      duration: '120min'
    },
    {
      title: 'Quality Assurance Best Practices',
      description: 'Learn QA methodologies and testing strategies',
      category: 'QA',
      tags: ['quality', 'testing', 'processes'],
      level: 'intermediate',
      type: 'training',
      duration: '90min'
    },
    {
      title: 'Machine Learning for Beginners',
      description: 'Introduction to ML concepts and practical applications',
      category: 'AI',
      tags: ['machine learning', 'ai', 'data science'],
      level: 'beginner',
      type: 'course',
      duration: '240min'
    }
  ];
  
  return {
    loadData: function(agentConfig) {
      return {
        success: true,
        data: mockData,
        metadata: {
          source: 'Mock Data',
          rows: mockData.length,
          lastUpdated: new Date(),
          description: 'Sample data for testing and development'
        }
      };
    },
    
    validateData: function(data) {
      return {
        valid: true,
        errors: []
      };
    },
    
    getMetadata: function() {
      return {
        name: 'Mock Data Provider',
        version: '1.0.0',
        description: 'Provides sample data for testing and development'
      };
    }
  };
}

/**
 * Multi-Source Data Provider
 * Combines data from multiple providers
 */
function createMultiSourceDataProvider(providers) {
  return {
    loadData: function(agentConfig) {
      try {
        const allData = [];
        const metadata = {
          sources: [],
          totalRows: 0,
          lastUpdated: new Date()
        };
        
        for (const provider of providers) {
          const result = provider.loadData(agentConfig);
          
          if (result.success) {
            allData.push(...result.data);
            metadata.sources.push({
              name: provider.getMetadata().name,
              rows: result.data.length,
              metadata: result.metadata
            });
          } else {
            console.warn(`Provider failed: ${result.error}`);
          }
        }
        
        metadata.totalRows = allData.length;
        
        return {
          success: true,
          data: allData,
          metadata: metadata
        };
        
      } catch (error) {
        return {
          success: false,
          error: `Multi-source data loading failed: ${error.message}`,
          data: []
        };
      }
    },
    
    validateData: function(data) {
      // Use validation from the first provider that has it
      for (const provider of providers) {
        if (provider.validateData) {
          return provider.validateData(data);
        }
      }
      
      return { valid: true, errors: [] };
    },
    
    getMetadata: function() {
      return {
        name: 'Multi-Source Data Provider',
        version: '1.0.0',
        description: `Combines data from ${providers.length} sources`,
        sources: providers.map(p => p.getMetadata().name)
      };
    }
  };
}

/**
 * Factory function to create data providers
 * @param {string} type - Type of data provider
 * @param {Object} config - Provider configuration
 * @returns {Object} Data provider instance
 */
function createDataProvider(type, config = {}) {
  switch (type.toLowerCase()) {
    case 'sheets':
    case 'google_sheets':
      return createSheetsDataProvider();
    
    case 'json':
      return createJSONDataProvider(config.data);
    
    case 'api':
    case 'rest':
      return createAPIDataProvider(config.url, config.apiConfig);
    
    case 'mock':
    case 'sample':
      return createMockDataProvider();
    
    case 'multi':
    case 'combined':
      return createMultiSourceDataProvider(config.providers);
    
    default:
      throw new Error(`Unknown data provider type: ${type}`);
  }
} 