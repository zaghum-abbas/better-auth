/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-server";
import { getSubscriptionStatus } from "@/lib/subscription";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionStatus = await getSubscriptionStatus(session.user.id);

    return NextResponse.json({
      success: true,
      subscription: subscriptionStatus,
    });
  } catch (error: any) {
    console.error("Error fetching subscription status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}
