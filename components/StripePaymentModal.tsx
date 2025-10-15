"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amount: number;
  interval: string;
  priceId: string;
  onSuccess?: () => void;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

const validationSchema = Yup.object({
  billingFullName: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  billingAddress: Yup.string().required("Address is required"),
  billingCity: Yup.string().required("City is required"),
  billingState: Yup.string().required("State is required"),
  billingCountry: Yup.string().required("Country is required"),
  billingZip: Yup.string().required("ZIP code is required"),
});

const initialValues = {
  billingFullName: "",
  email: "",
  billingAddress: "",
  billingCity: "",
  billingState: "",
  billingCountry: "",
  billingZip: "",
};

const PaymentForm = ({
  planName,
  amount,
  interval,
  priceId,
  onClose,
  onSuccess,
}: Omit<StripePaymentModalProps, "isOpen">) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: typeof initialValues) => {
    if (!stripe || !elements) {
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        setErrorMessage("Card element not found");
        setIsProcessing(false);
        return;
      }
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardNumberElement,
          billing_details: {
            name: values.billingFullName,
            email: values.email,
            address: {
              line1: values.billingAddress,
              city: values.billingCity,
              state: values.billingState,
              country: values.billingCountry?.slice(0, 2),
              postal_code: values.billingZip,
            },
          },
        });
      if (paymentMethodError) {
        setErrorMessage(
          paymentMethodError.message || "Failed to create payment method"
        );
        setIsProcessing(false);
        return;
      }
      const response = await axios.post(
        "/api/subscription/create-subscription",
        {
          priceId,
          paymentMethodId: paymentMethod.id,
          planName,
        }
      );
      const { clientSecret, status } = response.data;
      if (status === "active") {
        onSuccess?.();
        onClose();
      } else if (clientSecret) {
        const { error: confirmError } =
          await stripe.confirmCardPayment(clientSecret);
        if (confirmError) {
          setErrorMessage(confirmError.message || "Payment failed");
          setIsProcessing(false);
        } else {
          onSuccess?.();
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error || "An unexpected error occurred"
      );
      setIsProcessing(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, setFieldValue, setFieldTouched }) => (
        <Form className="space-y-6">
          {console.log(errors, "errors") as any}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-semibold text-gray-900">{planName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-semibold text-gray-900">
                  ${amount.toFixed(2)}/{interval}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Billing Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Billing Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    id="billingFullName"
                    name="billingFullName"
                    type="text"
                    placeholder={"Full Name"}
                    value={values.billingFullName}
                    onChange={(e) =>
                      setFieldValue("billingFullName", e.target.value)
                    }
                    onBlur={() => setFieldTouched("billingFullName", true)}
                    className={
                      errors.billingFullName && touched.billingFullName
                        ? "border-red-500 "
                        : ""
                    }
                    error={errors.billingFullName}
                    touched={touched.billingFullName}
                  />

                  <Input
                    label="Email"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
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

                <Input
                  label="Address"
                  id="billingAddress"
                  name="billingAddress"
                  type="text"
                  placeholder="123 Main St"
                  value={values.billingAddress}
                  onChange={(e) =>
                    setFieldValue("billingAddress", e.target.value)
                  }
                  onBlur={() => setFieldTouched("billingAddress", true)}
                  className={
                    errors.billingAddress && touched.billingAddress
                      ? "border-red-500 "
                      : ""
                  }
                  error={errors.billingAddress}
                  touched={touched.billingAddress}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Country"
                    id="billingCountry"
                    name="billingCountry"
                    type="text"
                    placeholder="United States"
                    value={values.billingCountry}
                    onChange={(e) =>
                      setFieldValue("billingCountry", e.target.value)
                    }
                    onBlur={() => setFieldTouched("billingCountry", true)}
                    className={
                      errors.billingCountry && touched.billingCountry
                        ? "border-red-500 "
                        : ""
                    }
                    error={errors.billingCity}
                    touched={touched.billingCity}
                  />
                  <Input
                    label="City"
                    id="billingCity"
                    name="billingCity"
                    type="text"
                    placeholder="New York"
                    value={values.billingCity}
                    onChange={(e) =>
                      setFieldValue("billingCity", e.target.value)
                    }
                    onBlur={() => setFieldTouched("billingCity", true)}
                    className={
                      errors.billingCity && touched.billingCity
                        ? "border-red-500 "
                        : ""
                    }
                    error={errors.billingCity}
                    touched={touched.billingCity}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="State"
                    id="billingState"
                    name="billingState"
                    type="text"
                    placeholder="New York"
                    value={values.billingState}
                    onChange={(e) =>
                      setFieldValue("billingState", e.target.value)
                    }
                    onBlur={() => setFieldTouched("billingState", true)}
                    className={
                      errors.billingState && touched.billingState
                        ? "border-red-500 "
                        : ""
                    }
                    error={errors.billingState}
                    touched={touched.billingState}
                  />
                  <Input
                    label="ZIP Code"
                    id="billingZip"
                    name="billingZip"
                    type="text"
                    placeholder="10001"
                    value={values.billingZip}
                    onChange={(e) =>
                      setFieldValue("billingZip", e.target.value)
                    }
                    onBlur={() => setFieldTouched("billingZip", true)}
                    className={
                      errors.billingZip && touched.billingZip
                        ? "border-red-500 "
                        : ""
                    }
                    error={errors.billingZip}
                    touched={touched.billingZip}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Card Information
                </h3>

                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="border p-3 rounded-md mt-3">
                    <CardNumberElement
                      options={{
                        ...cardElementOptions,
                        placeholder: "0000 0000 0000 0000",
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardExpiry">Expiration Date</Label>
                    <div className="border p-3 rounded-md mt-3">
                      <CardExpiryElement options={cardElementOptions} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardCvc">CVV</Label>
                    <div className="border p-3 rounded-md mt-3">
                      <CardCvcElement
                        options={{
                          ...cardElementOptions,
                          placeholder: "123",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Subscribe for $${amount.toFixed(2)}`
              )}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export function StripePaymentModal({
  isOpen,
  onClose,
  planName,
  amount,
  interval,
  priceId,
  onSuccess,
}: StripePaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subscribe to {planName}</DialogTitle>
          <DialogDescription>
            Enter your card details to complete your subscription
          </DialogDescription>
        </DialogHeader>

        <PaymentForm
          planName={planName}
          amount={amount}
          interval={interval}
          priceId={priceId}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
