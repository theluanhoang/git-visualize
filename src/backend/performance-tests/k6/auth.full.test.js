/**
 * Full Auth API Performance Test
 * 
 * Tests all auth endpoints with success cases, validation errors, and edge cases
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const authErrors = new Rate('auth_errors');
const authResponseTime = new Trend('auth_response_time');
const authSuccess = new Counter('auth_success_count');

// Test type: comprehensive (default), stress, spike
const TEST_TYPE = __ENV.TEST_TYPE || 'comprehensive';

// Test configuration based on TEST_TYPE
let stages, thresholds;

if (TEST_TYPE === 'stress') {
  // Stress test: Progressive load up to 500 users
  stages = [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '30s', target: 200 },
    { duration: '2m', target: 200 },
    { duration: '1m', target: 500 },
    { duration: '3m', target: 500 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 0 },
  ];
  thresholds = {
    http_req_duration: ['p(95)<30000', 'p(99)<60000'], // More lenient for stress
    http_req_failed: ['rate<0.10'],
    auth_errors: ['rate<0.10'],
  };
} else if (TEST_TYPE === 'spike') {
  // Spike test: Sudden traffic increase
  stages = [
    { duration: '30s', target: 10 },
    { duration: '2m', target: 10 },
    { duration: '10s', target: 200 }, // Sudden spike
    { duration: '2m', target: 200 },
    { duration: '10s', target: 500 }, // Another spike
    { duration: '1m', target: 500 },
    { duration: '10s', target: 50 }, // Rapid decrease
    { duration: '2m', target: 10 },
    { duration: '30s', target: 0 },
  ];
  thresholds = {
    http_req_duration: ['p(95)<5000', 'p(99)<10000'], // Lenient for spike
    http_req_failed: ['rate<0.15'],
    auth_errors: ['rate<0.10'],
  };
} else {
  // Comprehensive test: Normal load with all test cases
  stages = [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ];
  thresholds = {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.75'], // Allow 4xx from negative tests
    auth_errors: ['rate<0.05'], // Only 5xx errors
  };
}

export const options = {
  stages,
  thresholds,
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

export default function () {
  const vuId = __VU || Math.floor(Math.random() * 10000);
  const iterId = __ITER || Math.floor(Math.random() * 10000);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  
  const validEmail = `test_vu${vuId}_iter${iterId}_${timestamp}_${random}@example.com`;
  const validPassword = 'Test123!@#';

  // 1. Register
  const registerRes = http.post(
    `${BASE_URL}${API_PREFIX}/auth/register`,
    JSON.stringify({ email: validEmail, password: validPassword }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  let accessToken = null;
  let refreshToken = null;
  let userId = null;

  if (registerRes.status === 201) {
    try {
      const body = JSON.parse(registerRes.body);
      userId = body.id;
      authSuccess.add(1);
      authErrors.add(0);
    } catch {
      authErrors.add(1);
    }
  } else if (registerRes.status >= 500) {
    authErrors.add(1);
  } else {
    authErrors.add(0);
  }
  authResponseTime.add(registerRes.timings.duration);
  sleep(1);

  // 2. Validation error - invalid email
  const invalidEmailRes = http.post(
    `${BASE_URL}${API_PREFIX}/auth/register`,
    JSON.stringify({ email: 'invalid', password: validPassword }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  authErrors.add(invalidEmailRes.status >= 500 ? 1 : 0);
  sleep(0.5);

  // 3. Login
  if (userId) {
    const loginRes = http.post(
      `${BASE_URL}${API_PREFIX}/auth/login`,
      JSON.stringify({ email: validEmail, password: validPassword }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (loginRes.status === 200 || loginRes.status === 201) {
      try {
        const body = JSON.parse(loginRes.body);
        accessToken = body.accessToken;
        refreshToken = body.refreshToken;
        authSuccess.add(1);
        authErrors.add(0);
      } catch {
        authErrors.add(1);
      }
    } else if (loginRes.status >= 500) {
      authErrors.add(1);
    } else {
      authErrors.add(0);
    }
    authResponseTime.add(loginRes.timings.duration);
    sleep(0.5);

    // 4. Login error - wrong password
    const wrongPasswordRes = http.post(
      `${BASE_URL}${API_PREFIX}/auth/login`,
      JSON.stringify({ email: validEmail, password: 'wrong' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    authErrors.add(wrongPasswordRes.status >= 500 ? 1 : 0);
    sleep(0.5);

    // 5. Get me
    if (accessToken) {
      const meRes = http.get(
        `${BASE_URL}${API_PREFIX}/auth/me`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      check(meRes, {
        'me status 200': (r) => r.status === 200,
      });

      if (meRes.status === 200) {
        authSuccess.add(1);
        authErrors.add(0);
      } else if (meRes.status >= 500) {
        authErrors.add(1);
      } else {
        authErrors.add(0);
      }
      authResponseTime.add(meRes.timings.duration);
      sleep(0.5);

      // 6. Unauthorized - no token
      const meNoTokenRes = http.get(`${BASE_URL}${API_PREFIX}/auth/me`);
      authErrors.add(meNoTokenRes.status >= 500 ? 1 : 0);
      sleep(0.5);

      // 7. Refresh token
      if (refreshToken && userId) {
        const refreshRes = http.post(
          `${BASE_URL}${API_PREFIX}/auth/refresh`,
          JSON.stringify({ userId, refreshToken }),
          { headers: { 'Content-Type': 'application/json' } }
        );

        check(refreshRes, {
          'refresh status 200 or 201': (r) => r.status === 200 || r.status === 201,
        });

        if (refreshRes.status === 200 || refreshRes.status === 201) {
          authSuccess.add(1);
          authErrors.add(0);
        } else if (refreshRes.status >= 500) {
          authErrors.add(1);
        } else {
          authErrors.add(0);
        }
        authResponseTime.add(refreshRes.timings.duration);
        sleep(0.5);

        // 8. Logout
        const logoutRes = http.post(
          `${BASE_URL}${API_PREFIX}/auth/logout`,
          JSON.stringify({ userId, refreshToken }),
          { headers: { 'Content-Type': 'application/json' } }
        );

        const logoutSuccess = check(logoutRes, {
          'logout status 200 or 201 or 404': (r) => 
            r.status === 200 || r.status === 201 || r.status === 404 || r.status === 401,
        });

        if (logoutSuccess) {
          authSuccess.add(1);
          authErrors.add(0);
        } else if (logoutRes.status >= 500) {
          authErrors.add(1);
        } else {
          authErrors.add(0);
        }
        authResponseTime.add(logoutRes.timings.duration);
      }
    }
  }

  sleep(0.5);
}

