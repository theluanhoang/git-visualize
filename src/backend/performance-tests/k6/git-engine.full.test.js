/**
 * Full Git Engine API Performance Test
 * 
 * Tests git engine endpoints with success cases, validation errors, and edge cases
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const gitEngineErrors = new Rate('git_engine_errors');
const gitEngineResponseTime = new Trend('git_engine_response_time');
const gitEngineSuccess = new Counter('git_engine_success_count');

// Test type: comprehensive (default), stress, spike
const TEST_TYPE = __ENV.TEST_TYPE || 'comprehensive';

// Test configuration based on TEST_TYPE
let stages, thresholds;

if (TEST_TYPE === 'stress') {
  // Stress test: Progressive load up to 150 users (lower due to heavy processing)
  stages = [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 30 },
    { duration: '1m', target: 30 },
    { duration: '30s', target: 50 },
    { duration: '2m', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 150 },
    { duration: '3m', target: 150 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 30 },
    { duration: '30s', target: 0 },
  ];
  thresholds = {
    http_req_duration: ['p(95)<30000', 'p(99)<60000'],
    http_req_failed: ['rate<0.60'],
    git_engine_errors: ['rate<0.10'],
  };
} else if (TEST_TYPE === 'spike') {
  // Spike test: Sudden traffic increase
  stages = [
    { duration: '30s', target: 10 },
    { duration: '2m', target: 10 },
    { duration: '10s', target: 150 }, // Sudden spike
    { duration: '2m', target: 150 },
    { duration: '10s', target: 200 }, // Another spike
    { duration: '1m', target: 200 },
    { duration: '10s', target: 50 }, // Rapid decrease
    { duration: '2m', target: 10 },
    { duration: '30s', target: 0 },
  ];
  thresholds = {
    http_req_duration: ['p(95)<5000', 'p(99)<10000'],
    http_req_failed: ['rate<0.60'],
    git_engine_errors: ['rate<0.10'],
  };
} else {
  // Comprehensive test: Normal load with all test cases
  stages = [
    { duration: '30s', target: 10 },
    { duration: '2m', target: 10 },
    { duration: '30s', target: 20 },
    { duration: '2m', target: 20 },
    { duration: '30s', target: 0 },
  ];
  thresholds = {
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
    http_req_failed: ['rate<0.60'], // Allow 4xx from negative tests
    git_engine_errors: ['rate<0.05'], // Only 5xx errors
  };
}

export const options = {
  stages,
  thresholds,
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

export default function () {
  // 1. Execute git command - git status
  const executeStatusRes = http.post(
    `${BASE_URL}${API_PREFIX}/git/execute`,
    JSON.stringify({
      command: 'git status',
      repositoryState: null,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(executeStatusRes, {
    'execute status status 200': (r) => r.status === 200,
    'execute status has output': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.output !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (executeStatusRes.status === 200) {
    gitEngineSuccess.add(1);
    gitEngineErrors.add(0);
  } else if (executeStatusRes.status >= 500) {
    gitEngineErrors.add(1);
  } else {
    gitEngineErrors.add(0);
  }
  gitEngineResponseTime.add(executeStatusRes.timings.duration);
  sleep(1);

  // 2. Execute git command - git init
  const executeInitRes = http.post(
    `${BASE_URL}${API_PREFIX}/git/execute`,
    JSON.stringify({
      command: 'git init',
      repositoryState: null,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(executeInitRes, {
    'execute init status 200': (r) => r.status === 200,
  });

  if (executeInitRes.status === 200) {
    gitEngineSuccess.add(1);
    gitEngineErrors.add(0);
  } else if (executeInitRes.status >= 500) {
    gitEngineErrors.add(1);
  } else {
    gitEngineErrors.add(0);
  }
  gitEngineResponseTime.add(executeInitRes.timings.duration);
  sleep(1);

  // 3. Execute with state
  let repositoryState = null;
  if (executeInitRes.status === 200) {
    try {
      const body = JSON.parse(executeInitRes.body);
      repositoryState = body.repositoryState;
    } catch {
      // Continue without state
    }
  }

  if (repositoryState) {
    const executeWithStateRes = http.post(
      `${BASE_URL}${API_PREFIX}/git/execute`,
      JSON.stringify({
        command: 'git status',
        repositoryState: repositoryState,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(executeWithStateRes, {
      'execute with state status 200': (r) => r.status === 200,
    });

    if (executeWithStateRes.status === 200) {
      gitEngineSuccess.add(1);
      gitEngineErrors.add(0);
    } else if (executeWithStateRes.status >= 500) {
      gitEngineErrors.add(1);
    } else {
      gitEngineErrors.add(0);
    }
    gitEngineResponseTime.add(executeWithStateRes.timings.duration);
    sleep(1);
  }

  // 4. Validation error - missing command
  const missingCommandRes = http.post(
    `${BASE_URL}${API_PREFIX}/git/execute`,
    JSON.stringify({
      repositoryState: null,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(missingCommandRes, {
    'missing command returns 400': (r) => r.status === 400,
  });
  gitEngineErrors.add(missingCommandRes.status >= 500 ? 1 : 0);
  sleep(1);

  // 5. Validate practice
  const validatePracticeRes = http.post(
    `${BASE_URL}${API_PREFIX}/git/validate-practice`,
    JSON.stringify({
      command: 'git status',
      expectedOutput: 'On branch main',
      repositoryState: null,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(validatePracticeRes, {
    'validate practice status 200': (r) => r.status === 200,
    'validate practice has result': (r) => {
      try {
        const body = JSON.parse(r.body);
        return typeof body.isValid === 'boolean';
      } catch {
        return false;
      }
    },
  });

  if (validatePracticeRes.status === 200) {
    gitEngineSuccess.add(1);
    gitEngineErrors.add(0);
  } else if (validatePracticeRes.status >= 500) {
    gitEngineErrors.add(1);
  } else {
    gitEngineErrors.add(0);
  }
  gitEngineResponseTime.add(validatePracticeRes.timings.duration);
  sleep(1);
}

