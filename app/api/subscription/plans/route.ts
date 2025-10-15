/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-server";
import Stripe from "stripe";

const stripeClient = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

console.log("stripeClient", stripeClient.products);

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Plans API: Getting session...");

    const session = await auth.api.getSession({
      headers: await request.headers,
    });

    if (!session?.user) {
      console.log("❌ Plans API: No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // const subscriptions = await auth.api.listActiveSubscriptions({
    //   query: { referenceId: "123" },
    //   headers: await request.headers,
    // });

    // console.log("subscriptions", subscriptions);

    // const stripePlugin = await auth.options.plugins[2];
    // const allProducts = await stripePlugin.endpoints.listActiveSubscriptions({
    //   method: "GET",
    //   body: {

    //   },
    //   headers: await request.headers,
    //   path: "/api/subscription/plans",
    //   request: request,
    // });

    // console.log("allProducts", allProducts);

    const products: any = await stripeClient.products.list({
      limit: 100,
      active: true,
      expand: ["data.prices"],
    });
    for (const product of products.data) {
      const prices: any = await stripeClient.prices.list({
        product: product.id,
      });
      product.prices = prices.data;
    }
    products.data.sort((a: any, b: any) => {
      const lowestPriceA = Math.min(
        ...a.prices.map((price: any) => price.unit_amount)
      );
      const lowestPriceB = Math.min(
        ...b.prices.map((price: any) => price.unit_amount)
      );
      return lowestPriceA - lowestPriceB;
    });

    // Sort products by price

    return NextResponse.json({
      success: true,
      data: products?.data,
    });
  } catch (error) {
    console.error("❌ Plans API: Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
