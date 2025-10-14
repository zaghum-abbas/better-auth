"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useState } from "react";

/**
 * Comprehensive examples of using better-auth Stripe subscription methods
 * This file demonstrates all available subscription operations
 */
export function SubscriptionExamples() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = async (
    apiCall: () => Promise<any>,
    description: string
  ) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiCall();
      setResult({ description, data });
      console.log(`${description} result:`, data);
    } catch (err: any) {
      setError(`${description} failed: ${err.message}`);
      console.error(`${description} error:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Better-Auth Subscription Examples</h1>

      <div className="grid grid-cols-2 gap-4">
        {/* 1. List all subscriptions */}
        <button
          onClick={() =>
            handleApiCall(
              () =>
                authClient.subscription.list({
                  query: { referenceId: "123" },
                }),
              "List Subscriptions"
            )
          }
          className="p-4 border rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          <h3 className="font-semibold">1. List Subscriptions</h3>
          <p className="text-sm text-gray-600">
            Get all subscriptions for a user
          </p>
        </button>

        {/* 2. List active subscriptions */}
        <button
          onClick={() =>
            handleApiCall(
              () =>
                authClient.subscription.listActive({
                  query: { referenceId: "123" },
                }),
              "List Active Subscriptions"
            )
          }
          className="p-4 border rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          <h3 className="font-semibold">2. List Active Subscriptions</h3>
          <p className="text-sm text-gray-600">Get only active subscriptions</p>
        </button>

        {/* 3. Upgrade subscription */}
        <button
          onClick={() =>
            handleApiCall(
              () =>
                authClient.subscription.upgrade({
                  plan: "pro",
                  annual: true,
                  referenceId: "123",
                  metadata: { upgradedAt: new Date().toISOString() },
                  seats: 1,
                  successUrl: "http://localhost:3000/dashboard?upgrade=success",
                  cancelUrl: "http://localhost:3000/pricing?upgrade=cancelled",
                  returnUrl: "http://localhost:3000/dashboard",
                  disableRedirect: true,
                }),
              "Upgrade Subscription"
            )
          }
          className="p-4 border rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          <h3 className="font-semibold">3. Upgrade Subscription</h3>
          <p className="text-sm text-gray-600">Upgrade to a higher plan</p>
        </button>

        {/* 4. Cancel subscription */}
        <button
          onClick={() =>
            handleApiCall(
              () =>
                authClient.subscription.cancel({
                  subscriptionId: "sub_123", // Replace with actual subscription ID
                  cancelAtPeriodEnd: true,
                }),
              "Cancel Subscription"
            )
          }
          className="p-4 border rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          <h3 className="font-semibold">4. Cancel Subscription</h3>
          <p className="text-sm text-gray-600">Cancel at period end</p>
        </button>

        {/* 5. Reactivate subscription */}
        <button
          onClick={() =>
            handleApiCall(
              () =>
                authClient.subscription.reactivate({
                  subscriptionId: "sub_123", // Replace with actual subscription ID
                }),
              "Reactivate Subscription"
            )
          }
          className="p-4 border rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          <h3 className="font-semibold">5. Reactivate Subscription</h3>
          <p className="text-sm text-gray-600">
            Reactivate cancelled subscription
          </p>
        </button>

        {/* 6. Update subscription */}
        <button
          onClick={() =>
            handleApiCall(
              () =>
                authClient.subscription.update({
                  subscriptionId: "sub_123", // Replace with actual subscription ID
                  seats: 5,
                  metadata: { updatedAt: new Date().toISOString() },
                }),
              "Update Subscription"
            )
          }
          className="p-4 border rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          <h3 className="font-semibold">6. Update Subscription</h3>
          <p className="text-sm text-gray-600">Update seats or metadata</p>
        </button>
      </div>

      {/* Results */}
      {loading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">Processing...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">
            {result.description}
          </h3>
          <pre className="text-sm text-green-700 overflow-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}

      {/* Server-side examples */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Server-Side Examples</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Server-side upgrade example:</h3>
            <pre className="text-sm bg-white p-3 rounded border overflow-auto">
              {`// In your API route
import { auth } from "@/lib/auth/auth-server";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await auth.api.upgradeSubscription({
    body: {
      plan: "pro",
      annual: true,
      referenceId: "123",
      metadata: { upgradedAt: new Date().toISOString() },
      seats: 1,
      successUrl: "http://localhost:3000/dashboard?upgrade=success",
      cancelUrl: "http://localhost:3000/pricing?upgrade=cancelled",
      returnUrl: "http://localhost:3000/dashboard",
      disableRedirect: true,
    },
    headers: await headers(),
  });

  return NextResponse.json({ data });
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">List subscriptions server-side:</h3>
            <pre className="text-sm bg-white p-3 rounded border overflow-auto">
              {`const subscriptions = await auth.api.listActiveSubscriptions({
  query: { referenceId: "123" },
  headers: await headers(),
});`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
