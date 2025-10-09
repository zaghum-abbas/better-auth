"use client";

import { Formik, Form } from "formik";
import { signupValidationSchema, SignupFormValues } from "@/lib/validations";
import { SocialProvider } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const initialValues: SignupFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(
    null
  );

  const handleSubmit = async (
    values: SignupFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    await authClient.signUp.email(
      {
        email: values.email,
        name: values.firstName + " " + values.lastName,
        password: values.password,
      },
      {
        onSuccess: () => {
          toast.success("Account created successfully!");
          resetForm();
          router.push("/");
        },
        onError: ({ error }) => {
          console.error("Signup error:", error.message);
          toast.error(error.message);
        },
        onSettled: () => {
          setSubmitting(false);
        },
      }
    );
  };

  const handleSocialSignup = async (provider: SocialProvider) => {
    setSocialLoading(provider);

    await authClient.signIn.social(
      {
        provider: provider,
      },
      {
        onSuccess: () => {
          // Social signup success is handled by redirect
        },
        onError: ({ error }) => {
          console.error(`${provider} signup error:`, error);
          toast.error(`${provider} signup failed. Please try again.`);
        },
        onSettled: () => {
          setSocialLoading(null);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Create an account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your information to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={initialValues}
              validationSchema={signupValidationSchema}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Input
                        label="First Name"
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder={"First Name"}
                        value={values.firstName}
                        onChange={(e) =>
                          setFieldValue("firstName", e.target.value)
                        }
                        onBlur={() => setFieldTouched("firstName", true)}
                        className={
                          errors.firstName && touched.firstName
                            ? "border-red-500 "
                            : ""
                        }
                        error={errors.firstName}
                        touched={touched.firstName}
                      />
                    </div>

                    <div className="space-y-2">
                      <Input
                        label="Last Name"
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder={"Last Name"}
                        value={values.lastName}
                        onChange={(e) =>
                          setFieldValue("lastName", e.target.value)
                        }
                        onBlur={() => setFieldTouched("lastName", true)}
                        className={
                          errors.lastName && touched.lastName
                            ? "border-red-500 "
                            : ""
                        }
                        error={errors.lastName}
                        touched={touched.lastName}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="Email"
                      id="email"
                      name="email"
                      type="email"
                      placeholder={"Email"}
                      value={values.email}
                      onChange={(e) => setFieldValue("email", e.target.value)}
                      onBlur={() => setFieldTouched("email", true)}
                      className={
                        errors.email && touched.email ? "border-red-500 " : ""
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
                      placeholder={"Password"}
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
                  <div className="space-y-2 relative">
                    <Input
                      label="Confirm Password"
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={"Confirm Password"}
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
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        name="terms"
                        checked={values.terms}
                        onChange={(e) =>
                          setFieldValue("terms", e.target.checked)
                        }
                        onBlur={() => setFieldTouched("terms", true)}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                          errors.terms && touched.terms ? "border-red-500" : ""
                        }`}
                      />
                      <Label
                        htmlFor="terms"
                        className={`text-sm ${
                          errors.terms && touched.terms
                            ? "text-red-600"
                            : "text-gray-700"
                        }`}
                      >
                        {errors.terms && touched.terms
                          ? errors.terms
                          : `I agree to the Terms and Conditions`}
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || !values.terms}
                  >
                    {isSubmitting ? "Creating Account..." : "Create Account"}
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
                  onClick={() => handleSocialSignup("google")}
                  disabled={socialLoading !== null}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {socialLoading === "google" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                  ) : (
                    <FcGoogle className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {socialLoading === "google" ? "Signing up..." : "Google"}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleSocialSignup("github")}
                  disabled={socialLoading !== null}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {socialLoading === "github" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                  ) : (
                    <FaGithub className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {socialLoading === "github" ? "Signing up..." : "GitHub"}
                  </span>
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign in
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
