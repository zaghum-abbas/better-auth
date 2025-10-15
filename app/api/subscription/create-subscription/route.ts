/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-server";
import Stripe from "stripe";

const stripeClient = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId, paymentMethodId, planName } = await request.json();

    if (!priceId || !paymentMethodId) {
      return NextResponse.json(
        { error: "Price ID and Payment Method ID are required" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId: string | undefined;

    const existingCustomers = await stripeClient.customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripeClient.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;
    }

    // Attach payment method to customer if not already attached
    await stripeClient.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripeClient.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription: any = await stripeClient.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        userId: session.user.id,
        planName: planName || "",
      },
    });

    // Get the price details for storing in database
    const price = (await stripeClient.prices.retrieve(priceId)) as Stripe.Price;

    // Save subscription to database (this will be handled by webhook, but we can do it here too)
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(process.env.NEXT_DB_URI as string);
    const db = client.db();

    await db.collection("user").updateOne(
      { id: session.user.id },
      {
        $set: {
          stripeMeta: {
            subscriptionId: subscription.id,
            customerId: customerId,
            priceId: priceId,
            planName: planName,
            status: subscription.status,
            amount: price.unit_amount ? price.unit_amount / 100 : 0,
            currency: price.currency,
            interval: price.recurring?.interval || "month",
            currentPeriodStart: new Date(
              subscription.current_period_start * 1000
            ),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      }
    );

    const latestInvoice: any = subscription.latest_invoice;
    const paymentIntent: any = latestInvoice?.payment_intent;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret,
      status: subscription.status,
    });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}
