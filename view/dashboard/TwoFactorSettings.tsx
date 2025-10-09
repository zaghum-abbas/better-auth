"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth/auth-client";
import { TwoFactorSetupData } from "@/types";
import QRCode from "react-qr-code";

interface TwoFactorSettingsProps {
  user: any;
  onUpdate: () => void;
}

export default function TwoFactorSettings({
  user,
  onUpdate,
}: TwoFactorSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleEnable2FA = async () => {
    if (!password) {
      toast.error("Please enter your password to enable 2FA");
      return;
    }

    setIsEnabling(true);

    await authClient.twoFactor.enable(
      {
        password: password,
        issuer: "Better Auth App",
      },
      {
        onSuccess: ({ data }: any) => {
          console.log("data", data);
          setSetupData(data);
          toast.success(
            "2FA setup initiated. Please scan the QR code and enter the verification code."
          );
        },
        onError: ({ error }) => {
          toast.error(error.message || "Failed to enable 2FA");
        },
        onSettled: () => {
          setIsEnabling(false);
        },
      }
    );
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);

    await authClient.twoFactor.verifyTotp(
      {
        code: verificationCode,
      },
      {
        onSuccess: () => {
          toast.success("2FA enabled successfully!");
          setSetupData(null);
          setVerificationCode("");
          setPassword("");
          onUpdate();
        },
        onError: ({ error }) => {
          toast.error(error.message || "Invalid verification code");
        },
        onSettled: () => {
          setIsLoading(false);
        },
      }
    );
  };

  const handleDisable2FA = async () => {
    if (!password) {
      toast.error("Please enter your password to disable 2FA");
      return;
    }

    setIsDisabling(true);

    await authClient.twoFactor.disable(
      {
        password: password,
      },
      {
        onSuccess: () => {
          toast.success("2FA disabled successfully!");
          setPassword("");
          onUpdate();
        },
        onError: ({ error }) => {
          toast.error(error.message || "Failed to disable 2FA");
        },
        onSettled: () => {
          setIsDisabling(false);
        },
      }
    );
  };

  console.log("setupData", setupData?.totpURI);

  if (setupData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            Complete 2FA Setup
          </CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app and enter the
            verification code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border">
              <QRCode
                value={setupData.totpURI || ""}
                size={192}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>
          </div>

          {/* Verification Code Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Verification Code</label>
            <Input
              placeholder="Enter 6-digit code from your app"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setVerificationCode(value);
              }}
              maxLength={6}
              className="text-center text-lg font-mono tracking-widest"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleVerify2FA}
              disabled={isLoading || verificationCode.length !== 6}
              className="flex-1"
            >
              {isLoading ? "Verifying..." : "Verify & Enable 2FA"}
            </Button>
            <Button variant="outline" onClick={() => setSetupData(null)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {user?.twoFactorEnabled ? (
            <ShieldCheck className="h-5 w-5 text-green-600" />
          ) : (
            <Shield className="h-5 w-5 text-gray-400" />
          )}
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          {user?.twoFactorEnabled
            ? "2FA is currently enabled for your account"
            : "Add an extra layer of security to your account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user?.twoFactorEnabled ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✓ Two-factor authentication is enabled. Your account is
                protected with an additional security layer.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <div className="flex gap-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </div>
            </div>

            <Button
              onClick={handleDisable2FA}
              disabled={isDisabling || !password}
              variant="destructive"
              className="w-full"
            >
              {isDisabling ? "Disabling..." : "Disable 2FA"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Two-factor authentication is not enabled. Enable it to add an
                extra layer of security to your account.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <div className="flex gap-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </div>
            </div>

            <Button
              onClick={handleEnable2FA}
              disabled={isEnabling || !password}
              className="w-full"
            >
              {isEnabling ? "Setting up..." : "Enable 2FA"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
