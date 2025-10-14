"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Star, Zap, Crown, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { authClient } from "@/lib/auth/auth-client";
import { ensureArray } from "@/lib/helperFunctions";
import { StripePaymentModal } from "@/components/StripePaymentModal";
import { SubscriptionUpgrade } from "@/components/SubscriptionUpgrade";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

interface PriceOption {
  id: string;
  unit_amount: number;
  currency: string;
  interval: string;
  intervalCount: number;
  recurring: {
    interval: string;
  };
}

interface Plan {
  id: string;
  name: string;
  period: string;
  description: string;
  features: string[];
  metadata?: Record<string, any>;
  icon?: any;
  popular: boolean;
  buttonText: string;
  disabled: boolean;
  priceId: string;
  currency?: string;
  allPrices?: PriceOption[];
  prices?: PriceOption[];
}

export default function PlansPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "month"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<{
    name: string;
    amount: number;
    interval: string;
    priceId: string;
  } | null>(null);
  const [isBetterAuthUpgradeOpen, setIsBetterAuthUpgradeOpen] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/login");
    }
  }, [mounted, loading, user, router]);

  useEffect(() => {
    if (mounted) {
      fetchPlans();
    }
  }, [mounted]);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Fetching plans...");

      const response = await axios.get("/api/subscription/plans");
      console.log("🔍 Response:", response?.data?.data);
      setPlans(response?.data?.data);
    } catch (error) {
      console.error("❌ Error fetching plans:", error);
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const switchBillingInterval = (interval: "month" | "year") => {
    setBillingInterval(interval);
  };

  const getPriceForInterval = (plan: any) => {
    if (!plan.prices || plan.prices.length === 0) {
      return { amount: 0, priceId: "", currency: "usd" };
    }

    const price = plan.prices.find(
      (p: any) => p.recurring?.interval === billingInterval
    );

    return {
      amount: price ? (price.unit_amount || 0) / 100 : 0,
      priceId: price?.id || "",
      currency: price?.currency || "usd",
      interval: price?.recurring?.interval || billingInterval,
    };
  };

  const checksubscription = async () => {
    try {
      const { data: subscriptions, error }: any =
        await authClient.subscription.list({
          query: {
            referenceId: "123",
          },
        });

      if (error) {
        console.error("Error fetching subscriptions:", error);
        return;
      }

      const activeSubscription = subscriptions?.find(
        (sub: any) => sub.status === "active" || sub.status === "trialing"
      );

      console.log("activeSubscription", activeSubscription);
      setCurrentSubscription(activeSubscription);

      // Check subscription limits
      const projectLimit = subscriptions?.[0]?.limits;
    } catch (err) {
      console.error("Error in checksubscription:", err);
    }
  };

  useEffect(() => {
    checksubscription();
  }, []);

  const handlePlanSelect = async (plan: any, priceId: string) => {
    if (plan.disabled || !priceId) return;

    setSelectedPlan(plan.id);

    // Check if user has an active subscription
    if (currentSubscription) {
      // If user has active subscription, use better-auth upgrade method
      setSelectedPlanDetails({
        name: plan.name,
        amount: 0, // Will be handled by better-auth
        interval: billingInterval,
        priceId: priceId,
      });
      setIsBetterAuthUpgradeOpen(true);
    } else {
      // If no active subscription, use traditional Stripe checkout
      const priceInfo = getPriceForInterval(plan);
      setSelectedPlanDetails({
        name: plan.name,
        amount: priceInfo.amount,
        interval: billingInterval,
        priceId: priceId,
      });
      setIsModalOpen(true);
    }
  };

  const handlePaymentSuccess = () => {
    setIsModalOpen(false);
    setSelectedPlanDetails(null);
    setSelectedPlan(null);
    checksubscription(); // Refresh subscription status
    router.push("/");
  };

  const handleBetterAuthUpgradeSuccess = () => {
    setIsBetterAuthUpgradeOpen(false);
    setSelectedPlanDetails(null);
    setSelectedPlan(null);
    checksubscription(); // Refresh subscription status
    router.push("/");
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPlanDetails(null);
    setSelectedPlan(null);
  };

  const getIconComponent = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "free":
        return Star;
      case "pro":
        return Zap;
      case "enterprise":
        return Crown;
      default:
        return Star;
    }
  };

  if (!mounted || loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your needs. Upgrade or downgrade at any
            time.
          </p>

          <div className="flex items-center justify-center mt-8">
            <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm ">
              <button
                onClick={() => switchBillingInterval("month")}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200  cursor-pointer ${
                  billingInterval === "month"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => switchBillingInterval("year")}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  billingInterval === "year"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Yearly
                {/* <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  Save 20%
                </span> */}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {ensureArray(
            plans?.filter(
              (plan) =>
                plan.prices?.[0]?.recurring?.interval === billingInterval
            )
          )?.map((plan) => {
            const IconComponent = getIconComponent(plan.name);
            const isSelected = selectedPlan === plan.id;
            const priceInfo = getPriceForInterval(plan);

            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-200 ${
                  plan.name === "Pro"
                    ? "ring-2 ring-blue-500 shadow-lg scale-105"
                    : "hover:shadow-md"
                } ${isSelected ? "ring-2 ring-green-500" : ""}`}
              >
                {plan.name === "Pro" && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-gray-600" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ${(plan?.prices?.[0]?.unit_amount || 0) / 100}
                    </span>
                    <span className="text-gray-500 ml-2">
                      / {plan?.prices?.[0]?.recurring?.interval || "month"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {Object.entries(plan.metadata || {}).map(
                      ([key, value], index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{value}</span>
                        </li>
                      )
                    )}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.name === "Pro" ? "default" : "outline"}
                    disabled={!priceInfo.priceId || isProcessing}
                    onClick={() => handlePlanSelect(plan, priceInfo.priceId)}
                  >
                    {isProcessing && isSelected ? (
                      <div className="flex items-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                        Processing...
                      </div>
                    ) : currentSubscription ? (
                      plan.name.toLowerCase() ===
                      currentSubscription.plan?.toLowerCase() ? (
                        "Current Plan"
                      ) : (
                        `Upgrade to ${plan.name}`
                      )
                    ) : (
                      "Buy Now"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <strong className="text-gray-900">
                Can I change plans anytime?
              </strong>
              <p className="mt-1">
                Yes, you can upgrade or downgrade your plan at any time.
              </p>
            </div>
            <div>
              <strong className="text-gray-900">
                What payment methods do you accept?
              </strong>
              <p className="mt-1">
                We accept all major credit cards and PayPal.
              </p>
            </div>
            <div>
              <strong className="text-gray-900">Is there a free trial?</strong>
              <p className="mt-1">
                Yes, all paid plans come with a 14-day free trial.
              </p>
            </div>
            <div>
              <strong className="text-gray-900">Can I cancel anytime?</strong>
              <p className="mt-1">
                Yes, you can cancel your subscription at any time.
              </p>
            </div>
          </div>
        </div>

        {selectedPlanDetails && (
          <>
            <Elements stripe={stripePromise}>
              <StripePaymentModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                planName={selectedPlanDetails.name}
                amount={selectedPlanDetails.amount}
                interval={selectedPlanDetails.interval}
                priceId={selectedPlanDetails.priceId}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>

            <SubscriptionUpgrade
              isOpen={isBetterAuthUpgradeOpen}
              onClose={() => {
                setIsBetterAuthUpgradeOpen(false);
                setSelectedPlanDetails(null);
                setSelectedPlan(null);
              }}
              currentPlan={currentSubscription?.plan}
              targetPlan={selectedPlanDetails.name}
              isAnnual={billingInterval === "year"}
              onSuccess={handleBetterAuthUpgradeSuccess}
            />
          </>
        )}
      </div>
    </div>
  );
}
