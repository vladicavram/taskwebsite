// Script to verify production users via direct API call
// This will help us understand if the database migration affected user data

const https = require('https')

async function testLogin(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      usernameOrEmail: email,
      password: password,
      json: true
    })

    const options = {
      hostname: 'dozo.md',
      path: '/api/auth/callback/credentials',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`)
        console.log(`Response: ${body}`)
        resolve({ status: res.statusCode, body })
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function checkProdAuth() {
  console.log('Testing production authentication...\n')
  
  console.log('Test 1: Invalid credentials (should fail)')
  await testLogin('nonexistent@example.com', 'wrongpassword')
  
  console.log('\n---\n')
  console.log('Test 2: Try with common test credentials')
  console.log('Note: Update this script with actual user credentials to test')
  // Uncomment and add actual test user:
  // await testLogin('your-email@example.com', 'your-password')
}

checkProdAuth()
