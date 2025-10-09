"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { UserType } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const session = await authClient.getSession();

      if (session?.data?.user) {
        setUser(session.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Session check failed:", err);
      setError("Failed to check session");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      // Force a page reload to clear any cached state
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Logout failed");
    }
  };

  const refreshSession = async () => {
    await checkSession();
  };

  useEffect(() => {
    checkSession();
  }, []);

  return {
    user,
    loading,
    error,
    logout,
    refreshSession,
    checkSession,
  };
}
