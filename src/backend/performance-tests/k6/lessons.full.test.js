/**
 * Full Lessons API Performance Test
 * 
 * Tests main lesson endpoints with success cases, validation errors, and edge cases
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const lessonsErrors = new Rate('lessons_errors');
const lessonsResponseTime = new Trend('lessons_response_time');
const lessonsSuccess = new Counter('lessons_success_count');

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
    http_req_failed: ['rate<0.70'], // Allow auth/login failures
    lessons_errors: ['rate<0.10'],
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
    http_req_failed: ['rate<0.70'],
    lessons_errors: ['rate<0.10'],
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
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    http_req_failed: ['rate<0.55'], // Allow 4xx from negative tests
    lessons_errors: ['rate<0.05'], // Only 5xx errors
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
  let lessonId = null;

  // 1. List lessons
  const listRes = http.get(
    `${BASE_URL}${API_PREFIX}/lesson?offset=0&limit=20`,
    { headers }
  );

  check(listRes, {
    'list lessons status 200': (r) => r.status === 200,
    'list lessons has data': (r) => {
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
        lessonId = body.data[0].id;
      }
      lessonsSuccess.add(1);
      lessonsErrors.add(0);
    } catch {
      lessonsErrors.add(1);
    }
  } else if (listRes.status >= 500) {
    lessonsErrors.add(1);
  } else {
    lessonsErrors.add(0);
  }
  lessonsResponseTime.add(listRes.timings.duration);
  sleep(0.8);

  // 2. Validation error - invalid limit
  const invalidLimitRes = http.get(
    `${BASE_URL}${API_PREFIX}/lesson?offset=0&limit=200`,
    { headers }
  );
  lessonsErrors.add(invalidLimitRes.status >= 500 ? 1 : 0);
  sleep(0.8);

  // 3. Validation error - negative offset
  const negativeOffsetRes = http.get(
    `${BASE_URL}${API_PREFIX}/lesson?offset=-1&limit=20`,
    { headers }
  );
  lessonsErrors.add(negativeOffsetRes.status >= 500 ? 1 : 0);
  sleep(0.8);

  // 4. Track view
  if (lessonId && token) {
    const trackViewRes = http.post(
      `${BASE_URL}${API_PREFIX}/lesson/track-view`,
      JSON.stringify({ lessonId }),
      { headers: { ...headers, 'Content-Type': 'application/json' } }
    );

    check(trackViewRes, {
      'track view status 200 or 201': (r) => r.status === 200 || r.status === 201,
    });

    if (trackViewRes.status === 200 || trackViewRes.status === 201) {
      lessonsSuccess.add(1);
      lessonsErrors.add(0);
    } else if (trackViewRes.status >= 500) {
      lessonsErrors.add(1);
    } else {
      lessonsErrors.add(0);
    }
    lessonsResponseTime.add(trackViewRes.timings.duration);
    sleep(0.8);
  }

  // 5. Track view without token
  if (lessonId) {
    const trackViewNoTokenRes = http.post(
      `${BASE_URL}${API_PREFIX}/lesson/track-view`,
      JSON.stringify({ lessonId }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    lessonsErrors.add(trackViewNoTokenRes.status >= 500 ? 1 : 0);
    sleep(0.8);
  }

  // 6. Get view stats
  if (lessonId) {
    const viewStatsRes = http.get(
      `${BASE_URL}${API_PREFIX}/lesson/${lessonId}/view-stats`,
      { headers }
    );

    check(viewStatsRes, {
      'view stats status 200': (r) => r.status === 200,
    });

    if (viewStatsRes.status === 200) {
      lessonsSuccess.add(1);
      lessonsErrors.add(0);
    } else if (viewStatsRes.status >= 500) {
      lessonsErrors.add(1);
    } else {
      lessonsErrors.add(0);
    }
    lessonsResponseTime.add(viewStatsRes.timings.duration);
    sleep(0.8);
  }

  // 7. Get rating stats
  if (lessonId) {
    const ratingStatsRes = http.get(
      `${BASE_URL}${API_PREFIX}/lesson/${lessonId}/rating/stats`,
      { headers }
    );

    check(ratingStatsRes, {
      'rating stats status 200': (r) => r.status === 200,
    });

    if (ratingStatsRes.status === 200) {
      lessonsSuccess.add(1);
      lessonsErrors.add(0);
    } else if (ratingStatsRes.status >= 500) {
      lessonsErrors.add(1);
    } else {
      lessonsErrors.add(0);
    }
    lessonsResponseTime.add(ratingStatsRes.timings.duration);
    sleep(0.8);
  }

  // 8. Invalid UUID
  const invalidUUIDRes = http.get(
    `${BASE_URL}${API_PREFIX}/lesson/invalid-uuid/view-stats`,
    { headers }
  );
  lessonsErrors.add(invalidUUIDRes.status >= 500 ? 1 : 0);
  sleep(0.8);
}

