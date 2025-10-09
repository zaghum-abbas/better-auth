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
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  resetPasswordValidationSchema,
  ResetPasswordFormValues,
} from "@/lib/validations";

interface PasswordStepProps {
  onSubmit: (values: { password: string; confirmPassword: string }) => void;
  isSubmitting: boolean;
  onBack: () => void;
}

export default function PasswordStep({
  onSubmit,
  isSubmitting,
  onBack,
}: PasswordStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Reset your password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{ password: "", confirmPassword: "" }}
              validationSchema={resetPasswordValidationSchema}
              onSubmit={onSubmit}
            >
              {({
                values,
                errors,
                touched,
                setFieldValue,
                setFieldTouched,
              }) => (
                <Form className="space-y-4">
                  <div className="space-y-2 relative">
                    <Input
                      label="New Password"
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={values.password}
                      onChange={(e) =>
                        setFieldValue("password", e.target.value)
                      }
                      onBlur={() => setFieldTouched("password", true)}
                      className={
                        errors.password && touched.password
                          ? "border-red-500 pr-10"
                          : "pr-10"
                      }
                      error={errors.password}
                      touched={touched.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-2 relative">
                    <Input
                      label="Confirm New Password"
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={values.confirmPassword}
                      onChange={(e) =>
                        setFieldValue("confirmPassword", e.target.value)
                      }
                      onBlur={() => setFieldTouched("confirmPassword", true)}
                      className={
                        errors.confirmPassword && touched.confirmPassword
                          ? "border-red-500 pr-10"
                          : "pr-10"
                      }
                      error={errors.confirmPassword}
                      touched={touched.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Resetting password..." : "Reset password"}
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
                Back to verification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
