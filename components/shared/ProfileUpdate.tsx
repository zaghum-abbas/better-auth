"use client";

import { useState, useRef } from "react";
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
import { X, Camera, User, CreditCard, Settings } from "lucide-react";
import { UserType } from "@/types";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth/auth-client";
import Image from "next/image";
import * as yup from "yup";
import { profileUpdateValidationSchema } from "@/lib/validations";

interface ProfileUpdateProps {
  user: UserType;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ProfileUpdate({
  user,
  onClose,
  onUpdate,
}: ProfileUpdateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "billing">("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialValues = {
    name: user.name || "",
    email: user.email || "",
  };

  const handleSubmit = async (values: { name: string; email: string }) => {
    setIsSubmitting(true);
    await authClient.updateUser(
      {
        name: values.name,
      },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully!");
          onUpdate();
        },
        onError: ({ error }) => {
          toast.error(error.message || "Failed to update profile");
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/upload-profile-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }
      const { imageUrl } = await response.json();
      await authClient.updateUser(
        { image: imageUrl },
        {
          onSuccess: () => {
            toast.success("Profile image updated successfully!");
            onUpdate();
          },
          onError: ({ error }) => {
            toast.error(error.message || "Failed to update profile image");
          },
          onSettled: () => {
            setIsSubmitting(false);
          },
        }
      );
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
      setIsSubmitting(false);
    }
  };

  const handleStripePortal = async () => {
    try {
      // Create Stripe customer portal session
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Stripe portal error:", error);
      toast.error("Failed to open billing portal");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">
              Profile Settings
            </CardTitle>
            <CardDescription>
              Manage your profile and billing information
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("profile")}
              className="flex-1"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              variant={activeTab === "billing" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("billing")}
              className="flex-1"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </Button>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "Profile"}
                      width={100}
                      height={100}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 text-center">
                  Click the camera icon to upload a new profile image
                </p>
              </div>

              {/* Profile Form */}
              <Formik
                initialValues={initialValues}
                validationSchema={profileUpdateValidationSchema}
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
                        label="Full Name"
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={values.name}
                        onChange={(e) => setFieldValue("name", e.target.value)}
                        onBlur={() => setFieldTouched("name", true)}
                        error={errors.name}
                        touched={touched.name}
                      />
                    </div>

                    <div className="space-y-2">
                      <Input
                        label="Email"
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={values.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update Profile"}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Manage Billing</h3>
                  <p className="text-gray-500">
                    Update your payment methods, view invoices, and manage your
                    subscription
                  </p>
                </div>
                <Button onClick={handleStripePortal} className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Open Billing Portal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
