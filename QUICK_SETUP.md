# 🚀 Quick Setup Guide - Fix Environment Variables Error

## ❌ Current Error

You're getting this error because environment variables are not set up:

```
NEXT_DB_URI environment variable is not set
```

## ✅ Solution: Create Environment File

### Step 1: Create `.env.local` file

1. **Navigate to your project root** (same folder as `package.json`)
2. **Create a new file** called `.env.local`
3. **Copy and paste** the content below into the file

### Step 2: Add this content to `.env.local`

```bash
# Better Auth Configuration
NEXT_BETTER_AUTH_SECRET=your-secret-key-here-replace-with-actual-secret

# Database Configuration - Choose ONE option below:

# Option A: Local MongoDB (if you have MongoDB running locally)
NEXT_DB_URI=mongodb://localhost:27017/better-auth

# Option B: MongoDB Atlas (cloud - recommended for beginners)
# NEXT_DB_URI=mongodb+srv://username:password@cluster.mongodb.net/better-auth

# Resend Email Configuration (optional - comment out if not needed)
# NEXT_RESEND_API_KEY=re_your_resend_api_key
# NEXT_RESEND_FROM_EMAIL=noreply@yourdomain.com

# Stripe Configuration (optional - comment out if not needed)
# NEXT_STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
# STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Step 3: Replace the placeholder values

1. **NEXT_BETTER_AUTH_SECRET**: Generate a random secret key

   ```bash
   # You can use this online generator: https://generate-secret.vercel.app/32
   # Or use this command in terminal: openssl rand -base64 32
   NEXT_BETTER_AUTH_SECRET=your-actual-secret-key-here
   ```

2. **NEXT_DB_URI**: Choose your database option
   - **For local MongoDB**: Use `mongodb://localhost:27017/better-auth`
   - **For MongoDB Atlas**: Get connection string from https://cloud.mongodb.com

### Step 4: Restart your development server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm run dev
```

## 🎯 Quick MongoDB Atlas Setup (Recommended)

If you don't have MongoDB installed locally, use MongoDB Atlas (free):

1. **Go to**: https://cloud.mongodb.com
2. **Sign up** for free account
3. **Create a cluster** (free tier)
4. **Get connection string** from "Connect" button
5. **Replace** in `.env.local`:
   ```bash
   NEXT_DB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/better-auth
   ```

## 🔧 File Structure Should Look Like This:

```
better-auth/
├── .env.local          ← Create this file
├── package.json
├── next.config.ts
├── lib/
├── app/
└── ...
```

## ✅ After Setup

Your `.env.local` file should look like this:

```bash
NEXT_BETTER_AUTH_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
NEXT_DB_URI=mongodb://localhost:27017/better-auth
```

Then restart your server with `pnpm run dev`

## 🆘 Still Having Issues?

1. **Check file location**: `.env.local` must be in project root (same level as `package.json`)
2. **Check file name**: Must be exactly `.env.local` (with the dot)
3. **Restart server**: Always restart after creating/modifying `.env.local`
4. **No spaces**: Don't add spaces around `=` in environment variables

## 📞 Need Help?

If you're still stuck, share:

1. Your current `.env.local` file content (remove sensitive data)
2. The exact error message
3. Your operating system (Windows/Mac/Linux)
