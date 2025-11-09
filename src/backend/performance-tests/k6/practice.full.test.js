/**
 * Full Practice API Performance Test
 * 
 * Tests main practice endpoints with success cases, validation errors, and edge cases
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const practiceErrors = new Rate('practice_errors');
const practiceResponseTime = new Trend('practice_response_time');
const practiceSuccess = new Counter('practice_success_count');

// Test type: comprehensive (default), stress, spike
const TEST_TYPE = __ENV.TEST_TYPE || 'comprehensive';

// Test configuration based on TEST_TYPE
let stages, thresholds;

if (TEST_TYPE === 'stress') {
  // Stress test: Progressive load up to 300 users
  stages = [
    { duration: '30s', target: 15 },
    { duration: '1m', target: 15 },
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '30s', target: 200 },
    { duration: '2m', target: 200 },
    { duration: '1m', target: 300 },
    { duration: '3m', target: 300 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 0 },
  ];
  thresholds = {
    http_req_duration: ['p(95)<30000', 'p(99)<60000'],
    http_req_failed: ['rate<0.50'],
    practice_errors: ['rate<0.10'],
  };
} else if (TEST_TYPE === 'spike') {
  // Spike test: Sudden traffic increase
  stages = [
    { duration: '30s', target: 15 },
    { duration: '2m', target: 15 },
    { duration: '10s', target: 200 }, // Sudden spike
    { duration: '2m', target: 200 },
    { duration: '10s', target: 300 }, // Another spike
    { duration: '1m', target: 300 },
    { duration: '10s', target: 50 }, // Rapid decrease
    { duration: '2m', target: 15 },
    { duration: '30s', target: 0 },
  ];
  thresholds = {
    http_req_duration: ['p(95)<5000', 'p(99)<10000'],
    http_req_failed: ['rate<0.50'],
    practice_errors: ['rate<0.10'],
  };
} else {
  // Comprehensive test: Normal load with all test cases
  stages = [
    { duration: '30s', target: 15 },
    { duration: '2m', target: 15 },
    { duration: '30s', target: 30 },
    { duration: '2m', target: 30 },
    { duration: '30s', target: 0 },
  ];
  thresholds = {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.50'], // Allow 4xx from negative tests
    practice_errors: ['rate<0.05'], // Only 5xx errors
  };
}

export const options = {
  stages,
  thresholds,
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

// Helper: Get auth token
function getAuthToken() {
  if (AUTH_TOKEN) return AUTH_TOKEN;
  
  const loginRes = http.post(
    `${BASE_URL}${API_PREFIX}/auth/login`,
    JSON.stringify({
      email: __ENV.TEST_EMAIL || 'test@example.com',
      password: __ENV.TEST_PASSWORD || 'test123',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (loginRes.status === 200) {
    try {
      const body = JSON.parse(loginRes.body);
      return body.accessToken;
    } catch {
      return null;
    }
  }
  return null;
}

export default function () {
  const token = getAuthToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let practiceId = null;

  // 1. List practices
  const listRes = http.get(
    `${BASE_URL}${API_PREFIX}/practices?offset=0&limit=20`,
    { headers }
  );

  check(listRes, {
    'list practices status 200': (r) => r.status === 200,
    'list practices has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && Array.isArray(body.data);
      } catch {
        return false;
      }
    },
  });

  if (listRes.status === 200) {
    try {
      const body = JSON.parse(listRes.body);
      if (body.data && body.data.length > 0) {
        practiceId = body.data[0].id;
      }
      practiceSuccess.add(1);
      practiceErrors.add(0);
    } catch {
      practiceErrors.add(1);
    }
  } else if (listRes.status >= 500) {
    practiceErrors.add(1);
  } else {
    practiceErrors.add(0);
  }
  practiceResponseTime.add(listRes.timings.duration);
  sleep(0.8);

  // 2. Validation error - invalid offset
  const invalidOffsetRes = http.get(
    `${BASE_URL}${API_PREFIX}/practices?offset=-1&limit=20`,
    { headers }
  );
  practiceErrors.add(invalidOffsetRes.status >= 500 ? 1 : 0);
  sleep(0.8);

  // 3. Track view
  if (practiceId && token) {
    const trackViewRes = http.post(
      `${BASE_URL}${API_PREFIX}/practices/${practiceId}/view`,
      null,
      { headers }
    );

    check(trackViewRes, {
      'track view status 200 or 201 or 204': (r) => 
        r.status === 200 || r.status === 201 || r.status === 204,
    });

    if (trackViewRes.status === 200 || trackViewRes.status === 201 || trackViewRes.status === 204) {
      practiceSuccess.add(1);
      practiceErrors.add(0);
    } else if (trackViewRes.status >= 500) {
      practiceErrors.add(1);
    } else {
      practiceErrors.add(0);
    }
    practiceResponseTime.add(trackViewRes.timings.duration);
    sleep(0.8);
  }

  // 4. Track view without token
  if (practiceId) {
    const trackViewNoTokenRes = http.post(
      `${BASE_URL}${API_PREFIX}/practices/${practiceId}/view`,
      null,
      { headers: {} }
    );
    practiceErrors.add(trackViewNoTokenRes.status >= 500 ? 1 : 0);
    sleep(0.8);
  }

  // 5. Get repository state
  if (practiceId && token) {
    const repoStateRes = http.get(
      `${BASE_URL}${API_PREFIX}/practices/${practiceId}/repository-state`,
      { headers }
    );

    check(repoStateRes, {
      'repository state status 200 or 404': (r) => r.status === 200 || r.status === 404,
    });

    if (repoStateRes.status === 200 || repoStateRes.status === 404) {
      practiceSuccess.add(1);
      practiceErrors.add(0);
    } else if (repoStateRes.status >= 500) {
      practiceErrors.add(1);
    } else {
      practiceErrors.add(0);
    }
    practiceResponseTime.add(repoStateRes.timings.duration);
    sleep(0.8);
  }

  // 6. Repository state without token
  if (practiceId) {
    const repoStateNoTokenRes = http.get(
      `${BASE_URL}${API_PREFIX}/practices/${practiceId}/repository-state`,
      { headers: {} }
    );
    practiceErrors.add(repoStateNoTokenRes.status >= 500 ? 1 : 0);
    sleep(0.8);
  }

  // 7. Invalid practice ID
  const invalidIdRes = http.get(
    `${BASE_URL}${API_PREFIX}/practices/invalid-id/repository-state`,
    { headers }
  );
  practiceErrors.add(invalidIdRes.status >= 500 ? 1 : 0);
  sleep(0.8);
}

