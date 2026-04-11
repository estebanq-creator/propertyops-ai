#!/usr/bin/env node
/**
 * Mercury API Client - Production-Ready Integration
 * 
 * Enhanced client with:
 * - Rate limiting (respects Mercury API limits)
 * - Automatic retries with exponential backoff
 * - Error handling and health checks
 * - Request/response logging
 * 
 * Usage: 
 *   const apiClient = require('./api-client');
 *   const transactions = await apiClient.getTransactions(orgId, accountId, options);
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CREDENTIAL_DIR = path.join(process.env.HOME, '.openclaw/credentials');
const API_KEY_PATH = path.join(CREDENTIAL_DIR, 'mercury.key');
const ORG_CONFIG_PATH = path.join(CREDENTIAL_DIR, 'mercury-org.json');
const LOG_DIR = path.join(process.env.HOME, '.openclaw/workspace-hermes/agents/bookkeeping/output/api-logs');

// Mercury API rate limits (conservative estimates)
const RATE_LIMITS = {
  requestsPerSecond: 10,
  requestsPerMinute: 100,
  minIntervalMs: 100 // Minimum time between requests
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryableStatusCodes: [429, 500, 502, 503, 504]
};

// Request queue for rate limiting
let lastRequestTime = 0;
let requestQueue = [];

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Load and validate credentials
 */
function loadCredentials() {
  let apiKey, orgConfig, isMock = false;
  
  try {
    apiKey = fs.readFileSync(API_KEY_PATH, 'utf8').trim();
  } catch (err) {
    throw new Error(`API key not found: ${API_KEY_PATH}`);
  }
  
  try {
    orgConfig = JSON.parse(fs.readFileSync(ORG_CONFIG_PATH, 'utf8'));
    isMock = orgConfig.mockMode || false;
  } catch (err) {
    throw new Error(`Organization config not found: ${ORG_CONFIG_PATH}`);
  }
  
  return { apiKey, orgConfig, isMock };
}

/**
 * Rate-limited request wrapper
 */
async function rateLimitedRequest(fn) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMITS.minIntervalMs) {
    await new Promise(resolve => 
      setTimeout(resolve, RATE_LIMITS.minIntervalMs - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
  return fn();
}

/**
 * Exponential backoff retry wrapper
 */
async function withRetry(fn, attempt = 1) {
  try {
    return await fn();
  } catch (err) {
    const isRetryable = err.statusCode && RETRY_CONFIG.retryableStatusCodes.includes(err.statusCode);
    
    if (attempt >= RETRY_CONFIG.maxRetries || !isRetryable) {
      throw err;
    }
    
    const delay = Math.min(
      RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt - 1),
      RETRY_CONFIG.maxDelayMs
    );
    
    console.log(`   ⚠️  Retrying in ${delay}ms (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries})...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return withRetry(fn, attempt + 1);
  }
}

/**
 * Make HTTP request to Mercury API
 */
function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const { apiKey, orgConfig, isMock } = loadCredentials();
    
    // Mock mode
    if (isMock) {
      const mockMercury = require('./mock-mercury');
      
      return setTimeout(async () => {
        try {
          if (endpoint.includes('/balance')) {
            const orgId = endpoint.match(/\/organizations\/([^\/]+)/)?.[1];
            const accountId = endpoint.match(/\/accounts\/([^\/]+)/)?.[1];
            resolve(await mockMercury.getBalance(orgId, accountId));
          } else if (endpoint.includes('/transactions')) {
            const orgId = endpoint.match(/\/organizations\/([^\/]+)/)?.[1];
            const accountId = endpoint.match(/\/accounts\/([^\/]+)/)?.[1];
            const url = new URL('https://mock.local' + endpoint);
            const limit = parseInt(url.searchParams.get('limit') || '100');
            resolve(await mockMercury.getTransactions(orgId, accountId, { limit }));
          } else if (endpoint.includes('/accounts')) {
            const orgId = endpoint.match(/\/organizations\/([^\/]+)/)?.[1];
            resolve(await mockMercury.getAccounts(orgId));
          } else {
            const orgId = endpoint.match(/\/organizations\/([^\/]+)/)?.[1];
            resolve(await mockMercury.getOrganization(orgId));
          }
        } catch (err) {
          reject(err);
        }
      }, 100);
    }
    
    // Production API
    const options = {
      hostname: 'api.mercury.com',
      port: 443,
      path: `/api/v1${endpoint}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'PropertyOpsAI-BookkeepingAgent/2.0',
        'Accept': 'application/json'
      }
    };

    const startTime = Date.now();
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        // Log request
        logRequest(endpoint, res.statusCode, duration);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error(`JSON parse error: ${err.message}`));
          }
        } else {
          const error = new Error(`HTTP ${res.statusCode}: ${data}`);
          error.statusCode = res.statusCode;
          error.endpoint = endpoint;
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout (30s)'));
    });
    req.end();
  });
}

/**
 * Log API request for health monitoring
 */
function logRequest(endpoint, statusCode, duration) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    endpoint: endpoint,
    statusCode: statusCode,
    duration: duration,
    success: statusCode >= 200 && statusCode < 300
  };
  
  const logFile = path.join(LOG_DIR, `${new Date().toISOString().split('T')[0]}.jsonl`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

/**
 * Health check - verify API connectivity
 */
async function healthCheck() {
  try {
    const { orgConfig, isMock } = loadCredentials();
    const org = await makeRequest(`/organizations/${orgConfig.organizationId}`);
    
    return {
      healthy: true,
      mode: isMock ? 'mock' : 'production',
      organization: org.name || orgConfig.organizationId,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return {
      healthy: false,
      error: err.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get API usage statistics
 */
function getApiStats() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(LOG_DIR, `${today}.jsonl`);
    
    if (!fs.existsSync(logFile)) {
      return { requests: 0, avgLatency: 0, errors: 0 };
    }
    
    const lines = fs.readFileSync(logFile, 'utf8').trim().split('\n');
    const entries = lines.map(line => JSON.parse(line));
    
    const requests = entries.length;
    const avgLatency = entries.reduce((sum, e) => sum + e.duration, 0) / requests || 0;
    const errors = entries.filter(e => !e.success).length;
    
    return { requests, avgLatency, errors };
  } catch (err) {
    return { requests: 0, avgLatency: 0, errors: 0 };
  }
}

// Public API
module.exports = {
  /**
   * Get transactions for a date range
   */
  getTransactions: async (orgId, accountId, options = {}) => {
    const { start, end, limit = 100 } = options;
    
    return withRetry(() => rateLimitedRequest(() => {
      let endpoint = `/organizations/${orgId}/accounts/${accountId}/transactions?limit=${limit}`;
      if (start) endpoint += `&after=${encodeURIComponent(start)}`;
      if (end) endpoint += `&before=${encodeURIComponent(end)}`;
      
      return makeRequest(endpoint);
    }));
  },
  
  /**
   * Get account balance
   */
  getBalance: async (orgId, accountId) => {
    return withRetry(() => rateLimitedRequest(() => 
      makeRequest(`/organizations/${orgId}/accounts/${accountId}/balance`)
    ));
  },
  
  /**
   * Get organization info
   */
  getOrganization: async (orgId) => {
    return withRetry(() => rateLimitedRequest(() => 
      makeRequest(`/organizations/${orgId}`)
    ));
  },
  
  /**
   * Get accounts list
   */
  getAccounts: async (orgId) => {
    return withRetry(() => rateLimitedRequest(() => 
      makeRequest(`/organizations/${orgId}/accounts`)
    ));
  },
  
  /**
   * Health check
   */
  healthCheck,
  
  /**
   * Get API statistics
   */
  getApiStats,
  
  /**
   * Load credentials
   */
  loadCredentials
};