"use client";

import { useEffect, useState } from "react";
import { User, Mail, Key, CreditCard, Info } from "lucide-react";
import { createClient } from "@/lib/utils/supabase/client";
import Link from "next/link";
import { User as ClientUser } from "@supabase/supabase-js";
import { SubscriptionPreview } from "./Settings";

interface AccountSectionProps {
  user: ClientUser;
  subscription: SubscriptionPreview | null;
}

export default function AccountSection({
  user,
  subscription,
}: AccountSectionProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<{
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null>(subscription);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (subscription) {
      setIsLoadingSubscription(false);
    }
  }, [subscription]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName },
      });

      if (error) throw error;

      // Update user profile in database
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert({
          id: user.id,
          name: displayName,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setIsUpdating(false);

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create portal session");
      }

      const data = await response.json();

      if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Error opening customer portal:", err);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);

      // Call an API route to cancel the subscription
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      // Update local state
      setSubscriptionData((prev) =>
        prev
          ? {
              ...prev,
              cancelAtPeriodEnd: true,
            }
          : null
      );

      setMessage({
        type: "success",
        text: "Subscription will be canceled at the end of the billing period",
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      setMessage({ type: "error", text: "Failed to cancel subscription" });
    } finally {
      setIsCancelling(false);

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-5 w-5 text-[var(--accent-primary)]" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Account
        </h2>
      </div>

      <div className="space-y-6">
        {/* Email display (non-editable) */}
        <div>
          <label className="text-sm text-[var(--text-secondary)]">Email</label>
          <div className="flex items-center mt-1">
            <div className="flex items-center gap-3 bg-[var(--bg-hover)] py-2 px-3 rounded-lg w-full">
              <Mail className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-[var(--text-primary)]">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Display name edit form */}
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label className="text-sm text-[var(--text-secondary)]">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full mt-1 bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--bg-hover)] focus:border-[var(--accent-primary)] rounded-lg py-2 px-3 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary-80)] transition-colors disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Update Profile"}
            </button>

            {message && (
              <p
                className={`text-sm ${message.type === "success" ? "text-green-500" : "text-red-500"}`}
              >
                {message.text}
              </p>
            )}
          </div>
        </form>

        {/* Subscription section */}
        <div className="pt-5 border-t border-[var(--bg-hover)]">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-[var(--accent-primary)]" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Subscription
            </h3>
          </div>

          {isLoadingSubscription ? (
            <div className="py-2 text-[var(--text-secondary)]">
              Loading subscription details...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[var(--bg-hover)]/30 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--text-primary)] font-medium">
                    Status
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscriptionData?.status === "active"
                        ? "bg-green-500/10 text-green-500"
                        : subscriptionData?.status === "trialing"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-gray-500/10 text-gray-500"
                    }`}
                  >
                    {subscriptionData?.status === "active"
                      ? "Active"
                      : subscriptionData?.status === "trialing"
                        ? "Trial"
                        : "Inactive"}
                  </span>
                </div>

                {subscriptionData?.currentPeriodEnd && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--text-secondary)]">
                      Current period ends
                    </span>
                    <span className="text-[var(--text-primary)]">
                      {new Date(
                        subscriptionData.currentPeriodEnd
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {subscriptionData?.cancelAtPeriodEnd && (
                  <div className="mt-2 text-sm text-yellow-500 flex items-center gap-1.5">
                    <Info className="h-4 w-4" />
                    <span>Your subscription will not renew automatically</span>
                  </div>
                )}
              </div>

              {(subscriptionData?.status === "active" ||
                subscriptionData?.status === "trialing") && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleManageSubscription}
                    className="px-4 py-2 bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)]/80 transition-colors"
                  >
                    Manage Billing
                  </button>

                  {!subscriptionData.cancelAtPeriodEnd && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                      className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      {isCancelling ? "Processing..." : "Cancel Subscription"}
                    </button>
                  )}
                </div>
              )}

              {subscriptionData?.status !== "active" &&
                subscriptionData?.status !== "trialing" && (
                  <div>
                    <Link
                      href="/pricing"
                      className="inline-block px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary-80)] transition-colors"
                    >
                      View Plans
                    </Link>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Password change link */}
        <div className="pt-4 border-t border-[var(--bg-hover)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-[var(--text-primary)]">Password</span>
            </div>
            <Link
              href="/forgot-password"
              className="text-[var(--accent-primary)] hover:underline text-sm"
            >
              Change Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
