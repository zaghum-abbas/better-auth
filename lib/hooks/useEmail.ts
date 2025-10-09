import { useState } from "react";
import toast from "react-hot-toast";

interface EmailData {
  passwordReset?: {
    resetLink: string;
    userName?: string;
  };
  welcome?: {
    userName: string;
    loginLink: string;
  };
  emailVerification?: {
    verificationLink: string;
    userName?: string;
  };
  custom?: {
    subject: string;
    html: string;
    text?: string;
  };
}

interface UseEmailReturn {
  sendEmail: (type: string, to: string, data: EmailData) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const useEmail = (): UseEmailReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (
    type: string,
    to: string,
    data: EmailData
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          to,
          data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send email");
      }

      if (result.success) {
        toast.success("Email sent successfully!");
        return true;
      } else {
        throw new Error(result.error || "Failed to send email");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send email";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendEmail,
    loading,
    error,
  };
};

export default useEmail;
