"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ForgotPasswordFormValues } from "@/lib/validations";
import { authClient } from "@/lib/auth/auth-client";
import EmailStep from "./EmailStep";
import OtpStep from "./OtpStep";
import PasswordStep from "./PasswordStep";
import SuccessStep from "./SuccessStep";

export default function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "password" | "success">(
    "email"
  );
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");
  const handleEmailSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);

    await authClient.forgetPassword.emailOtp(
      {
        email: values.email,
      },
      {
        onSuccess: () => {
          setUserEmail(values.email);
          setStep("otp");
          setIsSubmitting(false);
          toast.success("Verification code sent to your email!");
        },
        onError: ({ error }) => {
          toast.error(error.message || "Failed to send OTP");
          setIsSubmitting(false);
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
  };
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsSubmitting(true);

    await authClient.emailOtp.checkVerificationOtp(
      {
        email: userEmail,
        otp: otp,
        type: "forget-password",
      },
      {
        onSuccess: () => {
          toast.success("Code verified!");
          setStep("password");
          setIsSubmitting(false);
        },
        onError: ({ error }) => {
          toast.error(error.message || "Invalid verification code");
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
  };
  const handlePasswordSubmit = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    setIsSubmitting(true);

    await authClient.emailOtp.resetPassword(
      {
        email: userEmail,
        otp: otp,
        password: values.password,
      },
      {
        onSuccess: () => {
          setStep("success");
          toast.success("Password reset successfully!");
        },
        onError: ({ error }) => {
          toast.error(error.message || "Failed to reset password");
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
  };
  const handleResendOTP = () => {
    setStep("email");
    setOtp("");
  };
  const handleBackToEmail = () => {
    setStep("email");
    setOtp("");
  };
  const handleBackToOTP = () => {
    setStep("otp");
  };
  switch (step) {
    case "email":
      return (
        <EmailStep onSubmit={handleEmailSubmit} isSubmitting={isSubmitting} />
      );

    case "otp":
      return (
        <OtpStep
          email={userEmail}
          otp={otp}
          setOtp={setOtp}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          onBack={handleBackToEmail}
          isSubmitting={isSubmitting}
        />
      );

    case "password":
      return (
        <PasswordStep
          onSubmit={handlePasswordSubmit}
          isSubmitting={isSubmitting}
          onBack={handleBackToOTP}
        />
      );

    case "success":
      return <SuccessStep />;

    default:
      return (
        <EmailStep onSubmit={handleEmailSubmit} isSubmitting={isSubmitting} />
      );
  }
}
