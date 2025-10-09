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
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordFormData } from "@/types";
import * as yup from "yup";
import { useRouter } from "next/navigation";

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters"),
});

const initialValues: ForgotPasswordFormData = {
  email: "",
};

interface EmailStepProps {
  onSubmit: (values: ForgotPasswordFormData) => void;
  isSubmitting: boolean;
}

export default function EmailStep({ onSubmit, isSubmitting }: EmailStepProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Forgot your password?
            </CardTitle>
            <CardDescription className="text-center">
              No worries, we'll send you a verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={initialValues}
              validationSchema={forgotPasswordSchema}
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
                  <div className="space-y-2">
                    <Input
                      label="Email"
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={values.email}
                      onChange={(e) => setFieldValue("email", e.target.value)}
                      onBlur={() => setFieldTouched("email", true)}
                      className={
                        errors.email && touched.email ? "border-red-500" : ""
                      }
                      error={errors.email}
                      touched={touched.email}
                    />
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>
                      Enter the email address associated with your account and
                      we'll send you a verification code to reset your password.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send verification code"}
                  </Button>
                </Form>
              )}
            </Formik>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => router.push("/login")}
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
