# Environment Variables Setup Guide

To fix the Resend API key error, you need to set up the following environment variables in your `.env.local` file:

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Better Auth Configuration
NEXT_BETTER_AUTH_SECRET=your-secret-key-here

# Database Configuration
# For local MongoDB:
NEXT_DB_URI=mongodb://localhost:27017/your-database-name
# For MongoDB Atlas (cloud):
# NEXT_DB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

# Stripe Configuration
NEXT_STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Resend Email Configuration (REQUIRED for email functionality)
NEXT_RESEND_API_KEY=re_your_resend_api_key
NEXT_RESEND_FROM_EMAIL=noreply@yourdomain.com

# Social Login Configuration (Optional)
NEXT_GITHUB_CLIENT_ID=your_github_client_id
NEXT_GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Database Setup Options

### Option 1: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use: `NEXT_DB_URI=mongodb://localhost:27017/better-auth`

### Option 2: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account and cluster
3. Get your connection string
4. Use: `NEXT_DB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name`

## How to Get Resend API Key

1. Go to [Resend.com](https://resend.com)
2. Sign up for an account
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `re_`)
6. Add it to your `.env.local` file as `NEXT_RESEND_API_KEY`

## Important Notes

- The `.env.local` file should be in your project root (same level as `package.json`)
- Never commit `.env.local` to version control
- Restart your development server after adding environment variables
- Make sure your domain is verified in Resend if you're using a custom domain

## Alternative: Disable Email Functionality

If you don't want to use email functionality right now, you can comment out the emailOTP plugin in your auth configuration:

```typescript
// In lib/auth/auth-server.ts
plugins: [
  nextCookies(),
  twoFactor(),
  // emailOTP({...}), // Comment this out temporarily
],
```

This will allow your app to run without email functionality.
