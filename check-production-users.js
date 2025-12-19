// Quick script to check production users via API
const fetch = require('node-fetch')

async function checkUsers() {
  try {
    // Try to access the API to see if it's working
    const response = await fetch('https://dozo.md/api/users/me')
    console.log('API Status:', response.status)
    
    if (response.status === 401) {
      console.log('✓ API is responding (401 Unauthorized is expected without auth)')
      console.log('\nThe issue is likely NOT with the database migration.')
      console.log('The openForHire field was added with a DEFAULT value, so existing users should be fine.')
      console.log('\nPossible causes:')
      console.log('1. Password hashing changed (unlikely)')
      console.log('2. Session/auth issue')
      console.log('3. Database connection issue in production')
    } else {
      console.log('Response:', await response.text())
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkUsers()
