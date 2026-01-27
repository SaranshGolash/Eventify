import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

const BASE_URL = 'http://localhost:5000/api/auth';
const TEST_USER = {
  name: 'Cookie Test User',
  email: `cookie_test_${Date.now()}@example.com`,
  password: 'password123',
  role: 'student'
};

async function testAuth() {
  console.log('--- Starting Auth Verification ---');

  // 1. Register
  console.log('\n1. Testing Registration...');
  let res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_USER)
  });

  if (!res.ok) {
    console.error('Registration Failed:', await res.text());
    return;
  }
  
  const cookie = res.headers.get('set-cookie');
  if (!cookie || !cookie.includes('jwt=')) {
    console.error('FAIL: No jwt cookie set during registration');
    return;
  }
  console.log('PASS: jwt cookie received:', cookie.split(';')[0]);

  // Extract cookie for subsequent requests
  const cookieHeader = cookie.split(';')[0];

  // 2. Check /me (Protected Route) with Cookie
  console.log('\n2. Testing Protected Route (/me)...');
  res = await fetch(`${BASE_URL}/me`, {
    headers: { 
      'Cookie': cookieHeader
    }
  });

  if (res.ok) {
    const data = await res.json();
    console.log('PASS: Accessed protected route as:', data.email);
  } else {
    console.error('FAIL: Could not access protected route:', await res.text());
  }

  // 3. Login
  console.log('\n3. Testing Login...');
  res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password })
  });
  
  const loginCookie = res.headers.get('set-cookie');
  if (loginCookie && loginCookie.includes('jwt=')) {
    console.log('PASS: Login successful, cookie set');
  } else {
    console.error('FAIL: Login did not set cookie');
  }

  // 4. Logout
  console.log('\n4. Testing Logout...');
  res = await fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    headers: { 'Cookie': cookieHeader }
  });
  
  const logoutCookie = res.headers.get('set-cookie');
  if (logoutCookie && (logoutCookie.includes('jwt=;') || logoutCookie.includes('Expires='))) {
     console.log('PASS: Logout cleared cookie');
  } else {
     console.log('WARN: Logout response cookie header unclear, but proceed if next step fails:', logoutCookie);
  }

  // 5. Check /me after Logout
  console.log('\n5. Accessing Protected Route after Logout...');
  res = await fetch(`${BASE_URL}/me`, {
    headers: { 
        'Cookie': 'jwt=' // Simulate cleared cookie or just omit header if client behaves perfectly, but here we just send empty/expired one if captured, or simply don't send one validation is important. 
        // Actually, if we just don't send the cookie it should fail. 
    }
  });

  if (res.status === 401) {
    console.log('PASS: Request rejected as expected (401)');
  } else {
    console.error('FAIL: Request succeeded or different error:', res.status);
  }
}

testAuth();
