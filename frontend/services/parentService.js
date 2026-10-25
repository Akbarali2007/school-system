// Parent Dashboard API calls.
//
// WHEN THE BACKEND TEAM GIVES YOU THE REAL ENDPOINTS:
// edit only the path strings in ENDPOINTS below. Nothing else needs to change.
const ENDPOINTS = {
  children: () => '/api/parent/children',
  summary: (childId) => `/api/parent/children/${childId}/summary`,
  attendance: (childId, month) =>
    `/api/parent/children/${childId}/attendance${month ? `?month=${month}` : ''}`,
  results: (childId) => `/api/parent/children/${childId}/results`,
  fees: (childId) => `/api/parent/children/${childId}/fees`,
  homework: (childId) => `/api/parent/children/${childId}/homework`,
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json.data;
}

export const parentService = {
  getChildren: () => request(ENDPOINTS.children()),
  getSummary: (childId) => request(ENDPOINTS.summary(childId)),
  getAttendance: (childId, month) => request(ENDPOINTS.attendance(childId, month)),
  getResults: (childId) => request(ENDPOINTS.results(childId)),
  getFees: (childId) => request(ENDPOINTS.fees(childId)),
  getHomework: (childId) => request(ENDPOINTS.homework(childId)),
};
