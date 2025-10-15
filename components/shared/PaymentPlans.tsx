"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, Check, Star, Zap, Crown } from "lucide-react";
import { UserType } from "@/types";
import toast from "react-hot-toast";

interface PaymentPlansProps {
  user: UserType;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Up to 5 projects",
      "Basic support",
      "1GB storage",
      "Standard templates",
    ],
    icon: Star,
    popular: false,
    buttonText: "Current Plan",
    disabled: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    period: "month",
    description: "Best for growing businesses",
    features: [
      "Unlimited projects",
      "Priority support",
      "10GB storage",
      "Premium templates",
      "Advanced analytics",
      "Team collaboration",
    ],
    icon: Zap,
    popular: true,
    buttonText: "Upgrade to Pro",
    disabled: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 49,
    period: "month",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Unlimited storage",
      "Custom integrations",
      "Dedicated support",
      "Advanced security",
      "Custom branding",
      "API access",
    ],
    icon: Crown,
    popular: false,
    buttonText: "Contact Sales",
    disabled: false,
  },
];

export default function PaymentPlans({
  user: _user,
  onClose,
  onSelectPlan: _onSelectPlan,
}: PaymentPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlanSelect = async (planId: string) => {
    if (planId === "free") return;
    setIsProcessing(true);
    setSelectedPlan(planId);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: planId,
          priceId: getPriceId(planId),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout process");
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const getPriceId = (planId: string) => {
    const priceIds = {
      pro: "price_1234567890",
      enterprise: "price_0987654321",
    };
    return priceIds[planId as keyof typeof priceIds];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Choose Your Plan
            </CardTitle>
            <CardDescription>
              Select the perfect plan for your needs. Upgrade or downgrade at
              any time.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              const isSelected = selectedPlan === plan.id;
              const isCurrentPlan = plan.id === "free";
              return (
                <Card
                  key={plan.id}
                  className={`relative transition-all duration-200 ${
                    plan.popular
                      ? "ring-2 ring-blue-500 shadow-lg scale-105"
                      : "hover:shadow-md"
                  } ${isSelected ? "ring-2 ring-green-500" : ""}`}
                >
                  {plan.popular && (
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
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-gray-500 ml-2">
                        /{plan.period === "forever" ? "forever" : plan.period}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-600">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      disabled={plan.disabled || isProcessing}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {isProcessing && isSelected ? (
                        <div className="flex items-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                          Processing...
                        </div>
                      ) : isCurrentPlan ? (
                        plan.buttonText
                      ) : (
                        plan.buttonText
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="text-center space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong>Can I change plans anytime?</strong>
                <p>Yes, you can upgrade or downgrade your plan at any time.</p>
              </div>
              <div>
                <strong>What payment methods do you accept?</strong>
                <p>We accept all major credit cards and PayPal.</p>
              </div>
              <div>
                <strong>Is there a free trial?</strong>
                <p>Yes, all paid plans come with a 14-day free trial.</p>
              </div>
              <div>
                <strong>Can I cancel anytime?</strong>
                <p>Yes, you can cancel your subscription at any time.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
