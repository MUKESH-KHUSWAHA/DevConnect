const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let userId = '';

// Generate random test user with shorter timestamp to avoid length issues
const timestamp = Date.now().toString().slice(-6);
const testUser = {
  username: `test${timestamp}`,
  email: `test${timestamp}@example.com`,
  password: 'Test@1234'
};

console.log('🚀 Starting E2E Tests for DevConnect Backend\n');

async function testSignup() {
  try {
    console.log('1️⃣  Testing Signup Endpoint...');
    const response = await axios.post(`${BASE_URL}/auth/signup`, testUser);
    
    if (response.status === 201 && response.data.token) {
      authToken = response.data.token;
      userId = response.data.user._id;
      console.log('   ✅ Signup successful');
      console.log(`   User ID: ${userId}`);
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
      return true;
    }
  } catch (error) {
    console.log('   ❌ Signup failed:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.log('   Validation errors:');
      error.response.data.errors.forEach(err => {
        console.log(`      - ${err.field}: ${err.message}`);
      });
    }
    return false;
  }
}

async function testLogin() {
  try {
    console.log('\n2️⃣  Testing Login Endpoint...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.status === 200 && response.data.token) {
      console.log('   ✅ Login successful');
      return true;
    }
  } catch (error) {
    console.log('   ❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testProtectedRoute() {
  try {
    console.log('\n3️⃣  Testing Protected Route (GET /posts/feed)...');
    const response = await axios.get(`${BASE_URL}/posts/feed`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
      console.log('   ✅ Protected route accessible with valid token');
      console.log(`   Fetched ${response.data.length} posts`);
      return true;
    }
  } catch (error) {
    console.log('   ❌ Protected route failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testProtectedRouteWithoutToken() {
  try {
    console.log('\n4️⃣  Testing Protected Route Without Token...');
    await axios.get(`${BASE_URL}/posts/feed`);
    console.log('   ❌ Protected route should have rejected request without token');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('   ✅ Protected route correctly rejected unauthorized request');
      return true;
    }
    console.log('   ❌ Unexpected error:', error.message);
    return false;
  }
}

async function testGetProfile() {
  try {
    console.log('\n5️⃣  Testing Get Profile Endpoint...');
    const response = await axios.get(`${BASE_URL}/profile/${userId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.user && response.data.user.username === testUser.username) {
      console.log('   ✅ Profile fetched successfully');
      console.log(`   Username: ${response.data.user.username}`);
      console.log(`   Posts count: ${response.data.posts.length}`);
      return true;
    }
  } catch (error) {
    console.log('   ❌ Get profile failed:', error.response?.data?.message || error.message);
    console.log(`   Attempted to fetch profile for userId: ${userId}`);
    return false;
  }
}

async function testInputValidation() {
  try {
    console.log('\n6️⃣  Testing Input Validation...');
    
    // Test invalid email
    try {
      await axios.post(`${BASE_URL}/auth/signup`, {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Test@1234'
      });
      console.log('   ❌ Should have rejected invalid email');
      return false;
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ Correctly rejected invalid email');
      }
    }
    
    // Test weak password
    try {
      await axios.post(`${BASE_URL}/auth/signup`, {
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'weak'
      });
      console.log('   ❌ Should have rejected weak password');
      return false;
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ Correctly rejected weak password');
      }
    }
    
    // Test invalid username
    try {
      await axios.post(`${BASE_URL}/auth/signup`, {
        username: 'ab', // too short
        email: 'test3@example.com',
        password: 'Test@1234'
      });
      console.log('   ❌ Should have rejected invalid username');
      return false;
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ Correctly rejected invalid username');
      }
    }
    
    return true;
  } catch (error) {
    console.log('   ❌ Validation test failed:', error.message);
    return false;
  }
}

async function runTests() {
  const results = [];
  
  results.push(await testSignup());
  results.push(await testLogin());
  results.push(await testProtectedRoute());
  results.push(await testProtectedRouteWithoutToken());
  results.push(await testGetProfile());
  results.push(await testInputValidation());
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Backend is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the logs above.');
  }
  
  console.log('\n💡 Note: Make sure the backend server is running on http://localhost:5000');
}

// Check if server is running first
axios.get('http://localhost:5000')
  .then(() => {
    console.log('✅ Backend server is running\n');
    runTests();
  })
  .catch(() => {
    console.log('❌ Backend server is not running on http://localhost:5000');
    console.log('Please start the server with: npm run dev\n');
    process.exit(1);
  });
