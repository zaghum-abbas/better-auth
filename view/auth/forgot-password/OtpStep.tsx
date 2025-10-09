"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ShieldCheck } from "lucide-react";

interface OtpStepProps {
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export default function OtpStep({
  email,
  otp,
  setOtp,
  onVerify,
  onResend,
  onBack,
  isSubmitting,
}: OtpStepProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Verify your email
            </CardTitle>
            <CardDescription className="text-center">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold text-gray-900">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                label="Verification Code"
                id="otp"
                name="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                }}
                maxLength={6}
                className="text-center text-2xl font-bold tracking-widest"
              />
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>
                Didn't receive the code?{" "}
                <button
                  onClick={onResend}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Send again
                </button>
              </p>
            </div>

            <Button
              onClick={onVerify}
              className="w-full"
              disabled={isSubmitting || otp.length !== 6}
            >
              {isSubmitting ? "Verifying..." : "Verify Code"}
            </Button>

            <Button variant="outline" onClick={onBack} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Change email
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
