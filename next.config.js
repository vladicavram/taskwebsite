/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Provide a fallback for NEXTAUTH_URL during build to prevent "Invalid URL" errors.
    // The actual value is set in Vercel environment variables and takes precedence at runtime.
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  }
}

module.exports = nextConfig
