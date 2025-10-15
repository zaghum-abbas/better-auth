/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-server";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      plan,
      annual = false,
      referenceId = "default",
      subscriptionId,
      metadata = {},
      seats = 1,
      successUrl,
      cancelUrl,
      returnUrl,
      disableRedirect = true,
    } = body;

    if (!plan) {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 });
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Success URL and Cancel URL are required" },
        { status: 400 }
      );
    }

    // Use better-auth's upgradeSubscription method
    const data = await auth.api.upgradeSubscription({
      body: {
        plan, // required
        annual,
        referenceId,
        subscriptionId,
        metadata,
        seats,
        successUrl, // required
        cancelUrl, // required
        returnUrl,
        disableRedirect, // required
      },
      // This endpoint requires session cookies.
      headers: await headers(),
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error upgrading subscription:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to upgrade subscription",
        details: error,
      },
      { status: 500 }
    );
  }
}
