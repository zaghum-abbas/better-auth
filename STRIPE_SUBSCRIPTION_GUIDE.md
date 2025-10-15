# Better-Auth Stripe Subscription Integration Guide

This guide explains how to use better-auth's Stripe subscription functionality in your application.

## Overview

Better-auth provides a comprehensive Stripe integration that handles subscription management, upgrades, cancellations, and more. You can use it both on the client-side and server-side.

## Configuration

Your better-auth configuration already includes the Stripe plugin:

```typescript
// lib/auth/auth-server.ts
import { stripe } from "@better-auth/stripe";

export const auth = betterAuth({
  // ... other config
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: async () => {
          // Fetch plans from Stripe
          const products = await stripeClient.products.list({
            active: true,
            limit: 100,
          });
          // ... return formatted plans
        },
      },
    }),
  ],
});
```

## Client-Side Usage

### 1. List Subscriptions

```typescript
import { authClient } from "@/lib/auth/auth-client";

// List all subscriptions
const { data: subscriptions, error } = await authClient.subscription.list({
  query: {
    referenceId: "123", // Optional reference ID
  },
});

// List only active subscriptions
const { data: activeSubscriptions, error } =
  await authClient.subscription.listActive({
    query: {
      referenceId: "123",
    },
  });
```

### 2. Upgrade Subscription

```typescript
const { data, error } = await authClient.subscription.upgrade({
  plan: "pro", // required
  annual: true,
  referenceId: "123",
  subscriptionId: "sub_123", // Optional - if upgrading existing subscription
  metadata: {
    upgradedFrom: "free",
    upgradedAt: new Date().toISOString(),
  },
  seats: 1,
  successUrl: "http://localhost:3000/dashboard?upgrade=success", // required
  cancelUrl: "http://localhost:3000/pricing?upgrade=cancelled", // required
  returnUrl: "http://localhost:3000/dashboard",
  disableRedirect: true, // required
});
```

### 3. Cancel Subscription

```typescript
const { data, error } = await authClient.subscription.cancel({
  subscriptionId: "sub_123",
  cancelAtPeriodEnd: true, // Cancel at end of billing period
});
```

### 4. Reactivate Subscription

```typescript
const { data, error } = await authClient.subscription.reactivate({
  subscriptionId: "sub_123",
});
```

### 5. Update Subscription

```typescript
const { data, error } = await authClient.subscription.update({
  subscriptionId: "sub_123",
  seats: 5, // Update number of seats
  metadata: {
    updatedAt: new Date().toISOString(),
  },
});
```

## Server-Side Usage

### 1. Upgrade Subscription (API Route)

```typescript
// app/api/subscription/upgrade/route.ts
import { auth } from "@/lib/auth/auth-server";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const data = await auth.api.upgradeSubscription({
    body: {
      plan: body.plan,
      annual: body.annual || false,
      referenceId: body.referenceId || "default",
      subscriptionId: body.subscriptionId,
      metadata: body.metadata || {},
      seats: body.seats || 1,
      successUrl: body.successUrl, // required
      cancelUrl: body.cancelUrl, // required
      returnUrl: body.returnUrl,
      disableRedirect: body.disableRedirect !== false,
    },
    headers: await headers(),
  });

  return NextResponse.json({ data });
}
```

### 2. List Active Subscriptions

```typescript
const subscriptions = await auth.api.listActiveSubscriptions({
  query: { referenceId: "123" },
  headers: await headers(),
});
```

## Components Created

### 1. SubscriptionUpgrade Component

Located at `components/SubscriptionUpgrade.tsx` - A modal component that handles subscription upgrades using better-auth.

**Features:**

- Two upgrade methods (direct client call and API call)
- Error handling
- Loading states
- Success/cancel URL configuration

### 2. SubscriptionManager Component

Located at `components/SubscriptionManager.tsx` - A comprehensive subscription management interface.

**Features:**

- List all subscriptions
- Cancel/reactivate subscriptions
- Update subscription seats
- Upgrade/downgrade functionality
- Real-time status updates

### 3. Updated Plans Page

The `view/pricing/plans.tsx` has been updated to:

- Detect existing subscriptions
- Use better-auth upgrade for existing customers
- Use traditional Stripe checkout for new customers
- Show current plan status

## API Endpoints Created

### 1. Upgrade Endpoint

**POST** `/api/subscription/upgrade`

Upgrades a user's subscription using better-auth.

**Request Body:**

```json
{
  "plan": "pro",
  "annual": true,
  "referenceId": "123",
  "subscriptionId": "sub_123",
  "metadata": {},
  "seats": 1,
  "successUrl": "http://localhost:3000/dashboard?upgrade=success",
  "cancelUrl": "http://localhost:3000/pricing?upgrade=cancelled",
  "returnUrl": "http://localhost:3000/dashboard",
  "disableRedirect": true
}
```

## Usage Examples

### Example 1: Simple Upgrade

```typescript
const handleUpgrade = async () => {
  const { data, error } = await authClient.subscription.upgrade({
    plan: "pro",
    annual: true,
    referenceId: "123",
    metadata: { upgradedFrom: "free" },
    seats: 1,
    successUrl: `${window.location.origin}/dashboard?upgrade=success`,
    cancelUrl: `${window.location.origin}/pricing?upgrade=cancelled`,
    returnUrl: `${window.location.origin}/dashboard`,
    disableRedirect: true,
  });

  if (data?.url) {
    window.location.href = data.url; // Redirect to Stripe checkout
  }
};
```

### Example 2: Check Subscription Status

```typescript
const checkSubscriptionStatus = async () => {
  const { data: subscriptions } = await authClient.subscription.listActive({
    query: { referenceId: "123" },
  });

  const activeSubscription = subscriptions?.find(
    (sub) => sub.status === "active" || sub.status === "trialing"
  );

  if (activeSubscription) {
    console.log("Current plan:", activeSubscription.plan);
    console.log("Seats:", activeSubscription.seats);
    console.log("Status:", activeSubscription.status);
  }
};
```

### Example 3: Cancel Subscription

```typescript
const handleCancel = async (subscriptionId: string) => {
  const { data, error } = await authClient.subscription.cancel({
    subscriptionId,
    cancelAtPeriodEnd: true, // Cancel at end of billing period
  });

  if (error) {
    console.error("Cancel failed:", error);
  } else {
    console.log("Subscription cancelled:", data);
  }
};
```

## Key Benefits

1. **Unified API**: Both client and server-side methods use the same interface
2. **Automatic Customer Creation**: Customers are created automatically on signup
3. **Webhook Integration**: Handles Stripe webhooks automatically
4. **Type Safety**: Full TypeScript support
5. **Error Handling**: Comprehensive error handling and validation
6. **Flexible**: Supports both immediate and scheduled changes

## Important Notes

1. **Required Parameters**: `plan`, `successUrl`, `cancelUrl`, and `disableRedirect` are required for upgrades
2. **Session Required**: All operations require an active user session
3. **Webhook Setup**: Ensure your Stripe webhook is configured to handle subscription events
4. **Error Handling**: Always check for errors in the response
5. **Redirects**: When `disableRedirect` is true, you'll get a checkout URL to redirect to manually

## Testing

Use the `examples/subscription-examples.tsx` component to test all subscription methods interactively.

## Troubleshooting

1. **Unauthorized Error**: Ensure user is logged in and session is valid
2. **Plan Not Found**: Verify the plan name matches your Stripe product names
3. **Webhook Issues**: Check webhook endpoint configuration and secret
4. **Customer Not Found**: Ensure `createCustomerOnSignUp` is enabled

This integration provides a complete subscription management solution using better-auth and Stripe.
