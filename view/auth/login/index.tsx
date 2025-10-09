"use client";

import { Formik, Form } from "formik";
import { loginValidationSchema, LoginFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { authClient } from "@/lib/auth/auth-client";
import { SocialProvider } from "@/types";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import TwoFactorStep from "@/components/shared";
import { Eye, EyeOff } from "lucide-react";

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(
    null
  );
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    setIsSubmitting(true);
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: ({ data }: any) => {
          console.log("data", data?.twoFactorRedirect);
          if (data?.twoFactorRedirect) {
            setIsSubmitting(false);
            setShowTwoFactor(true);
          } else {
            toast.success("Login successful!");
            resetForm();
            router.push("/");
          }
        },
        onError: ({ error }) => {
          console.error("Login error:", error.message);
          toast.error(error.message);
        },
        onSettled: () => {
          setIsSubmitting(false);
          setSubmitting(false);
        },
      }
    );
  };

  const handleTwoFactorSuccess = () => {
    toast.success("Login successful!");
    router.push("/");
  };

  const handleBackToLogin = () => {
    setShowTwoFactor(false);
    setIsSubmitting(false);
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    setSocialLoading(provider);

    await authClient.signIn.social(
      {
        provider: provider,
      },
      {
        onSuccess: () => {
          setSocialLoading(null);
        },
        onError: ({ error }) => {
          console.error(`${provider} login error:`, error);
          toast.error(`${provider} login failed. Please try again.`);
        },
        onSettled: () => {
          setSocialLoading(null);
        },
      }
    );
  };

  if (showTwoFactor) {
    return (
      <TwoFactorStep
        onSuccess={handleTwoFactorSuccess}
        onBack={handleBackToLogin}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={initialValues}
              validationSchema={loginValidationSchema}
              onSubmit={handleSubmit}
            >
              {({
                values,
                errors,
                touched,
                setFieldValue,
                setFieldTouched,
                isSubmitting,
              }) => (
                <Form className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      label="Email"
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email"
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
                  <div className="space-y-2 relative">
                    <Input
                      label="Password"
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
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
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm text-gray-700"
                      >
                        Remember me
                      </label>
                    </div>
                    <a
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Forgot password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </Form>
              )}
            </Formik>

            {/* Social Login Section */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin("google")}
                  disabled={socialLoading !== null}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {socialLoading === "google" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                  ) : (
                    <FcGoogle className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {socialLoading === "google" ? "Signing in..." : "Google"}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin("github")}
                  disabled={socialLoading !== null}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {socialLoading === "github" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                  ) : (
                    <FaGithub className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {socialLoading === "github" ? "Signing in..." : "GitHub"}
                  </span>
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign up
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
