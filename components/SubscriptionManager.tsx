"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth/auth-client";
import { SubscriptionUpgrade } from "./SubscriptionUpgrade";
import {
  CreditCard,
  Calendar,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface Subscription {
  id: string;
  status: string;
  plan: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  seats: number;
  metadata?: Record<string, any>;
}

export function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  // Fetch subscriptions using better-auth
  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Method 1: List all subscriptions
      const { data: allSubscriptions, error: listError } =
        await authClient.subscription.list({
          query: {
            referenceId: "123", // or any reference you're using
          },
        });

      if (listError) {
        throw new Error(listError.message || "Failed to fetch subscriptions");
      }

      console.log("All subscriptions:", allSubscriptions);
      setSubscriptions(allSubscriptions || []);

      // Method 2: Get active subscriptions specifically
      const { data: activeSubscriptions, error: activeError } =
        await authClient.subscription.listActive({
          query: {
            referenceId: "123",
          },
        });

      console.log("Active subscriptions:", activeSubscriptions);
    } catch (err: any) {
      console.error("Error fetching subscriptions:", err);
      setError(err.message || "Failed to fetch subscriptions");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      const { data, error: cancelError } = await authClient.subscription.cancel(
        {
          subscriptionId,
          cancelAtPeriodEnd: true, // Cancel at end of billing period
        }
      );

      if (cancelError) {
        throw new Error(cancelError.message || "Failed to cancel subscription");
      }

      console.log("Subscription cancelled:", data);
      await fetchSubscriptions(); // Refresh the list
    } catch (err: any) {
      console.error("Error cancelling subscription:", err);
      setError(err.message || "Failed to cancel subscription");
    }
  };

  // Reactivate subscription
  const handleReactivateSubscription = async (subscriptionId: string) => {
    try {
      const { data, error: reactivateError } =
        await authClient.subscription.reactivate({
          subscriptionId,
        });

      if (reactivateError) {
        throw new Error(
          reactivateError.message || "Failed to reactivate subscription"
        );
      }

      console.log("Subscription reactivated:", data);
      await fetchSubscriptions(); // Refresh the list
    } catch (err: any) {
      console.error("Error reactivating subscription:", err);
      setError(err.message || "Failed to reactivate subscription");
    }
  };

  // Update subscription seats
  const handleUpdateSeats = async (
    subscriptionId: string,
    newSeats: number
  ) => {
    try {
      const { data, error: updateError } = await authClient.subscription.update(
        {
          subscriptionId,
          seats: newSeats,
        }
      );

      if (updateError) {
        throw new Error(updateError.message || "Failed to update seats");
      }

      console.log("Seats updated:", data);
      await fetchSubscriptions(); // Refresh the list
    } catch (err: any) {
      console.error("Error updating seats:", err);
      setError(err.message || "Failed to update seats");
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trialing":
        return "bg-blue-100 text-blue-800";
      case "past_due":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading subscriptions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subscription Management</h2>
        <Button onClick={fetchSubscriptions} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Subscriptions
            </h3>
            <p className="text-gray-600 mb-4">
              You don't have any active subscriptions yet.
            </p>
            <Button onClick={() => (window.location.href = "/pricing")}>
              Browse Plans
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {subscription.plan || "Unknown Plan"}
                  </CardTitle>
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      Current period:{" "}
                      {new Date(
                        subscription.currentPeriodStart
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>
                      {subscription.seats} seat
                      {subscription.seats !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      This subscription will be cancelled at the end of the
                      current billing period.
                    </p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => {
                      setSelectedPlan("pro"); // or determine next plan
                      setIsUpgradeOpen(true);
                    }}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Upgrade
                  </Button>

                  <Button
                    onClick={() => {
                      setSelectedPlan("free"); // or determine downgrade plan
                      setIsUpgradeOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <ArrowDownRight className="h-4 w-4" />
                    Downgrade
                  </Button>

                  {subscription.cancelAtPeriodEnd ? (
                    <Button
                      onClick={() =>
                        handleReactivateSubscription(subscription.id)
                      }
                      variant="outline"
                      size="sm"
                    >
                      Reactivate
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCancelSubscription(subscription.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      const newSeats = subscription.seats + 1;
                      handleUpdateSeats(subscription.id, newSeats);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Add Seat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SubscriptionUpgrade
        isOpen={isUpgradeOpen}
        onClose={() => {
          setIsUpgradeOpen(false);
          setSelectedPlan("");
        }}
        targetPlan={selectedPlan}
        onSuccess={() => {
          fetchSubscriptions();
          setIsUpgradeOpen(false);
        }}
      />
    </div>
  );
}
