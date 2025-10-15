import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { emailOTP, twoFactor } from "better-auth/plugins";
import { Resend } from "resend";

const resend = new Resend("re_Qiszywor_M8hZ2cLGbWKiqKv6Z31MsgkL");

console.log("resend", resend);

const client = new MongoClient(
  "mongodb+srv://zaghumabbas524_db_user:zaghumabbas123@cluster0.lasguxc.mongodb.net/better-auth"
);

const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  appName: "better-auth",
  secret: process.env.NEXT_BETTER_AUTH_SECRET as string,
  trustedOrigins: ["*"],
  baseURL: "http://localhost:3000",
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.NEXT_GITHUB_CLIENT_ID as string,
      clientSecret: process.env.NEXT_GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.NEXT_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.NEXT_GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    nextCookies(),
    twoFactor(),
    emailOTP({
      generateOTP: () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      },
      async sendVerificationOTP({ email, otp, type }) {
        // Check if Resend is available
        if (!resend) {
          console.error("❌ Resend is not configured. Cannot send email.");
          throw new Error(
            "Email service is not configured. Please contact support."
          );
        }

        let subject = "";
        let htmlContent = "";

        if (type === "forget-password") {
          subject = "Password Reset Verification Code";
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Password Reset Request</h2>
              <p>You requested to reset your password. Please use the code below:</p>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                ${otp}
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
          `;
        }

        try {
          const fromEmail = process.env.NEXT_RESEND_FROM_EMAIL;
          if (!fromEmail) {
            throw new Error(
              "NEXT_RESEND_FROM_EMAIL environment variable is not set"
            );
          }

          const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [email],
            subject: subject,
            html: htmlContent,
          });

          if (error) {
            console.error("Resend error:", error);
            throw new Error(`Failed to send email: ${error.message}`);
          }

          console.log(`✅ OTP email sent to ${email} for ${type}`, data);
        } catch (error) {
          console.error("❌ Error sending email:", error);
          throw error;
        }
      },
    }),
  ],
});
