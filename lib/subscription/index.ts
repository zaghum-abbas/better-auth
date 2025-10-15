import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.NEXT_DB_URI as string);
const db = client.db();

export interface SubscriptionMeta {
  subscriptionId: string;
  customerId: string;
  priceId: string;
  planName: string;
  status: string;
  amount: number;
  currency: string;
  interval: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
}

/**
 * Get user's subscription information
 */
export async function getUserSubscription(
  userId: string
): Promise<SubscriptionMeta | null> {
  try {
    const user = await db.collection("user").findOne({ id: userId });

    if (!user || !user.stripeMeta) {
      return null;
    }

    return user.stripeMeta as SubscriptionMeta;
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return null;
  }
}

/**
 * Check if user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return false;
  }

  return subscription.status === "active" || subscription.status === "trialing";
}

/**
 * Check if user is subscribed to a specific plan
 */
export async function isSubscribedToPlan(
  userId: string,
  planName: string
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return false;
  }

  return (
    subscription.planName === planName &&
    (subscription.status === "active" || subscription.status === "trialing")
  );
}

/**
 * Get subscription status summary
 */
export async function getSubscriptionStatus(userId: string) {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return {
      isActive: false,
      planName: null,
      status: null,
      daysRemaining: null,
    };
  }

  const now = new Date();
  const periodEnd = new Date(subscription.currentPeriodEnd);
  const daysRemaining = Math.ceil(
    (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    isActive:
      subscription.status === "active" || subscription.status === "trialing",
    planName: subscription.planName,
    status: subscription.status,
    daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
    amount: subscription.amount,
    interval: subscription.interval,
    willCancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}
