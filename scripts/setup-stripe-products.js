const Stripe = require("stripe");
require("dotenv").config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
});

async function setupStripeProducts() {
  try {
    console.log("🔍 Setting up Stripe products for Better Auth...");

    // Create Basic Plan
    const basicProduct = await stripe.products.create({
      name: "Basic",
      description: "Perfect for getting started",
      metadata: {
        showInPlans: "true",
        maxProjects: "5",
        maxStorage: "10",
        freeTrial: "false",
      },
    });

    const basicPrice = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 0, // Free plan
      currency: "usd",
      metadata: {
        plan: "basic",
      },
    });

    console.log("✅ Basic plan created:", basicProduct.id, basicPrice.id);

    // Create Pro Plan
    const proProduct = await stripe.products.create({
      name: "Pro",
      description: "Best for growing businesses",
      metadata: {
        showInPlans: "true",
        maxProjects: "20",
        maxStorage: "50",
        freeTrial: "true",
      },
    });

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 1900, // $19.00
      currency: "usd",
      recurring: {
        interval: "month",
      },
      metadata: {
        plan: "pro",
      },
    });

    console.log("✅ Pro plan created:", proProduct.id, proPrice.id);

    // Create Enterprise Plan
    const enterpriseProduct = await stripe.products.create({
      name: "Enterprise",
      description: "For large organizations",
      metadata: {
        showInPlans: "true",
        maxProjects: "100",
        maxStorage: "500",
        freeTrial: "false",
      },
    });

    const enterprisePrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 4900, // $49.00
      currency: "usd",
      recurring: {
        interval: "month",
      },
      metadata: {
        plan: "enterprise",
      },
    });

    console.log(
      "✅ Enterprise plan created:",
      enterpriseProduct.id,
      enterprisePrice.id
    );

    console.log("\n🎉 All products created successfully!");
    console.log("\n📋 Summary:");
    console.log(`Basic Plan: ${basicProduct.id} - Price: ${basicPrice.id}`);
    console.log(`Pro Plan: ${proProduct.id} - Price: ${proPrice.id}`);
    console.log(
      `Enterprise Plan: ${enterpriseProduct.id} - Price: ${enterprisePrice.id}`
    );

    console.log("\n🔧 Next steps:");
    console.log("1. Update your auth-server.ts with the real price IDs");
    console.log("2. Test the /plans page");
    console.log("3. Set up webhooks in Stripe dashboard");
  } catch (error) {
    console.error("❌ Error setting up products:", error);
  }
}

setupStripeProducts();
