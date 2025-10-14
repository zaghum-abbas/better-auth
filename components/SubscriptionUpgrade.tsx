"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth/auth-client";
import { Loader2 } from "lucide-react";

interface SubscriptionUpgradeProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  targetPlan: string;
  isAnnual?: boolean;
  onSuccess?: () => void;
}

export function SubscriptionUpgrade({
  isOpen,
  onClose,
  currentPlan,
  targetPlan,
  isAnnual = false,
  onSuccess,
}: SubscriptionUpgradeProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Method 1: Using better-auth client directly
      const { data, error: upgradeError } =
        await authClient.subscription.upgrade({
          plan: targetPlan,
          annual: isAnnual,
          referenceId: "123",
          metadata: {
            upgradedFrom: currentPlan,
            upgradedAt: new Date().toISOString(),
          },
          seats: 1,
          successUrl: `${window.location.origin}/dashboard?upgrade=success`,
          cancelUrl: `${window.location.origin}/pricing?upgrade=cancelled`,
          returnUrl: `${window.location.origin}/dashboard`,
          disableRedirect: true, // required
        });

      if (upgradeError) {
        throw new Error(upgradeError.message || "Upgrade failed");
      }

      console.log("Upgrade successful:", data);

      // Handle the response based on your needs
      if (data?.url) {
        // If Stripe returns a checkout URL, redirect to it
        window.location.href = data.url;
      } else {
        // If upgrade was immediate, show success
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      console.error("Upgrade error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpgradeViaAPI = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Method 2: Using your custom API endpoint
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: targetPlan,
          annual: isAnnual,
          referenceId: "123",
          metadata: {
            upgradedFrom: currentPlan,
            upgradedAt: new Date().toISOString(),
          },
          seats: 1,
          successUrl: `${window.location.origin}/dashboard?upgrade=success`,
          cancelUrl: `${window.location.origin}/pricing?upgrade=cancelled`,
          returnUrl: `${window.location.origin}/dashboard`,
          disableRedirect: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upgrade failed");
      }

      console.log("Upgrade successful:", result.data);

      if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      console.error("Upgrade error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade Subscription</DialogTitle>
          <DialogDescription>
            {currentPlan
              ? `Upgrade from ${currentPlan} to ${targetPlan}`
              : `Subscribe to ${targetPlan}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">Plan Details</h4>
            <p className="text-sm text-gray-600 mt-1">
              Target Plan: <span className="font-medium">{targetPlan}</span>
            </p>
            <p className="text-sm text-gray-600">
              Billing:{" "}
              <span className="font-medium">
                {isAnnual ? "Annual" : "Monthly"}
              </span>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                "Upgrade Now"
              )}
            </Button>
          </div>

          {/* Alternative method button for testing */}
          <Button
            onClick={handleUpgradeViaAPI}
            disabled={isProcessing}
            variant="secondary"
            className="w-full"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              "Upgrade via API (Alternative)"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
