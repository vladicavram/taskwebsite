const https = require('https');

async function testProductionAPI() {
  console.log('=== Testing Production API ===\n');
  
  // Test 1: Login as admin
  console.log('1. Logging in as admin...');
  const loginData = JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  });
  
  const loginOptions = {
    hostname: 'taskwebsite-vladicavrams-projects.vercel.app',
    path: '/api/auth/callback/credentials',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };
  
  const loginReq = https.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Login response status:', res.statusCode);
      console.log('Set-Cookie headers:', res.headers['set-cookie']);
      
      // Extract session token from cookies
      const cookies = res.headers['set-cookie'];
      if (cookies) {
        const sessionCookie = cookies.find(c => c.includes('next-auth.session-token'));
        if (sessionCookie) {
          const token = sessionCookie.split(';')[0];
          console.log('\n2. Testing /api/notifications with session...');
          
          // Test 2: Get notifications
          const notifOptions = {
            hostname: 'taskwebsite-vladicavrams-projects.vercel.app',
            path: '/api/notifications',
            method: 'GET',
            headers: {
              'Cookie': token
            }
          };
          
          const notifReq = https.request(notifOptions, (notifRes) => {
            let notifData = '';
            notifRes.on('data', (chunk) => notifData += chunk);
            notifRes.on('end', () => {
              console.log('Notifications response status:', notifRes.statusCode);
              try {
                const notifications = JSON.parse(notifData);
                console.log('Notifications count:', notifications.length || 0);
                if (notifications.error) {
                  console.log('Error:', notifications.error);
                } else if (notifications.length > 0) {
                  console.log('\nSample notifications:');
                  notifications.slice(0, 3).forEach((n, i) => {
                    console.log(`  ${i+1}. Type: ${n.type}, Read: ${n.read}`);
                    console.log(`     Content: ${n.content}`);
                  });
                }
              } catch (e) {
                console.log('Response:', notifData);
              }
            });
          });
          
          notifReq.on('error', (e) => console.error('Notifications request error:', e));
          notifReq.end();
        } else {
          console.log('No session token found in cookies');
        }
      }
    });
  });
  
  loginReq.on('error', (e) => console.error('Login request error:', e));
  loginReq.write(loginData);
  loginReq.end();
}

testProductionAPI();
