import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { MongoClient } from "mongodb";

const stripeClient = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

// MongoDB connection
const client = new MongoClient(process.env.NEXT_DB_URI as string);
const db = client.db();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripeClient.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✅ Checkout session completed:", session.id);

        // Retrieve subscription details
        if (session.subscription) {
          const subscription: any = await stripeClient.subscriptions.retrieve(
            session.subscription as string
          );

          const userId = session.metadata?.userId;
          const planName = session.metadata?.planName;

          if (userId) {
            // Get the price details
            const priceId = subscription.items.data[0]?.price.id;
            const price = (await stripeClient.prices.retrieve(
              priceId
            )) as Stripe.Price;

            // Update user table with subscription metadata
            await db.collection("user").updateOne(
              { id: userId },
              {
                $set: {
                  stripeMeta: {
                    subscriptionId: subscription.id,
                    customerId: subscription.customer as string,
                    priceId: priceId,
                    planName: planName,
                    status: subscription.status,
                    amount: price.unit_amount ? price.unit_amount / 100 : 0,
                    currency: price.currency,
                    interval: price.recurring?.interval || "month",
                    currentPeriodStart: new Date(
                      subscription.current_period_start * 1000
                    ),
                    currentPeriodEnd: new Date(
                      subscription.current_period_end * 1000
                    ),
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                },
              }
            );

            console.log("✅ User subscription data saved:", {
              userId,
              subscriptionId: subscription.id,
              planName,
              status: subscription.status,
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription: any = event.data.object;
        console.log("🔄 Subscription updated:", subscription.id);

        // Update user subscription status
        await db.collection("user").updateOne(
          { "stripeMeta.subscriptionId": subscription.id },
          {
            $set: {
              "stripeMeta.status": subscription.status,
              "stripeMeta.currentPeriodStart": new Date(
                subscription.current_period_start * 1000
              ),
              "stripeMeta.currentPeriodEnd": new Date(
                subscription.current_period_end * 1000
              ),
              "stripeMeta.cancelAtPeriodEnd": subscription.cancel_at_period_end,
              "stripeMeta.updatedAt": new Date(),
            },
          }
        );

        console.log("✅ Subscription updated for:", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("❌ Subscription cancelled:", subscription.id);

        // Mark subscription as cancelled
        await db.collection("user").updateOne(
          { "stripeMeta.subscriptionId": subscription.id },
          {
            $set: {
              "stripeMeta.status": "cancelled",
              "stripeMeta.cancelledAt": new Date(),
              "stripeMeta.updatedAt": new Date(),
            },
          }
        );

        console.log("✅ Subscription cancelled for:", subscription.id);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Payment succeeded for invoice:", invoice.id);

        // TODO: Update payment status in your database
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Payment failed for invoice:", invoice.id);

        // TODO: Handle failed payment (notify user, etc.)
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
