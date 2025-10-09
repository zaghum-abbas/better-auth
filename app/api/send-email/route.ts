import { NextRequest, NextResponse } from "next/server";
import EmailService from "@/lib/services/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, data } = body;

    if (!type || !to) {
      return NextResponse.json(
        { error: "Missing required fields: type and to" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "password-reset":
        if (!data.resetLink) {
          return NextResponse.json(
            { error: "Missing resetLink for password reset email" },
            { status: 400 }
          );
        }
        result = await EmailService.sendPasswordResetEmail(
          to,
          data.resetLink,
          data.userName
        );
        break;

      case "welcome":
        if (!data.userName || !data.loginLink) {
          return NextResponse.json(
            { error: "Missing userName and loginLink for welcome email" },
            { status: 400 }
          );
        }
        result = await EmailService.sendWelcomeEmail(
          to,
          data.userName,
          data.loginLink
        );
        break;

      case "email-verification":
        if (!data.verificationLink) {
          return NextResponse.json(
            { error: "Missing verificationLink for email verification" },
            { status: 400 }
          );
        }
        result = await EmailService.sendEmailVerification(
          to,
          data.verificationLink,
          data.userName
        );
        break;

      case "custom":
        if (!data.subject || !data.html) {
          return NextResponse.json(
            { error: "Missing subject and html for custom email" },
            { status: 400 }
          );
        }
        result = await EmailService.sendEmail(
          to,
          data.subject,
          data.html,
          data.text
        );
        break;

      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: "Email sent successfully",
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Test email configuration
export async function GET() {
  try {
    const result = await EmailService.testConnection();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email configuration is working",
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Email configuration failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json(
      { error: "Failed to test email configuration" },
      { status: 500 }
    );
  }
}
