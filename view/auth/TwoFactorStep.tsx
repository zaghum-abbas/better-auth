"use client";

import { Formik, Form } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { TwoFactorFormData } from "@/types";
import * as yup from "yup";
import { authClient } from "@/lib/auth/auth-client";

const twoFactorSchema = yup.object({
  code: yup
    .string()
    .required("Verification code is required")
    .length(6, "Code must be 6 digits")
    .matches(/^\d+$/, "Code must contain only numbers"),
});

const initialValues: TwoFactorFormData = {
  code: "",
};

interface TwoFactorStepProps {
  onSuccess: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (loading: boolean) => void;
}

export default function TwoFactorStep({
  onSuccess,
  onBack,
  isSubmitting,
  setIsSubmitting,
}: TwoFactorStepProps) {
  const [code, setCode] = useState("");

  const handleSubmit = async (values: TwoFactorFormData) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await authClient.twoFactor.verify({
        code: values.code,
      });

      if (error) {
        toast.error(error.message || "Invalid verification code");
        return;
      }

      toast.success("Two-factor authentication successful!");
      onSuccess();
    } catch (error) {
      console.error("2FA verification error:", error);
      toast.error("Failed to verify code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Two-Factor Authentication
            </CardTitle>
            <CardDescription className="text-center">
              Enter the 6-digit code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={initialValues}
              validationSchema={twoFactorSchema}
              onSubmit={handleSubmit}
            >
              {({
                values,
                errors,
                touched,
                setFieldValue,
                setFieldTouched,
              }) => (
                <Form className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      label="Verification Code"
                      id="code"
                      name="code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={values.code}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        setFieldValue("code", value);
                        setCode(value);
                      }}
                      maxLength={6}
                      className="text-center text-2xl font-bold tracking-widest"
                      error={errors.code}
                      touched={touched.code}
                    />
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    <p>
                      Open your authenticator app and enter the code shown for
                      this account.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || values.code.length !== 6}
                  >
                    {isSubmitting ? "Verifying..." : "Verify Code"}
                  </Button>
                </Form>
              )}
            </Formik>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
