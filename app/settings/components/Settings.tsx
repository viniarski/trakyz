// app/settings/components/Settings.tsx

"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/ui/navigation";
import PageHeader from "@/components/ui/page-header";
import AccountSection from "./account-section";
import CustomizationSection from "./customization-section";
import SecuritySection from "./security-section";
import SystemSection from "./system-section";
import { User } from "@supabase/supabase-js";

export type SubscriptionPreview = {
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

type SettingsProps = {
  user: User;
  subscriptionData: SubscriptionPreview | null;
};

export default function Settings({ user, subscriptionData }: SettingsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--text-secondary)]">
            Loading settings...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Navigation />
        <PageHeader
          title="Settings"
          description="Manage your account, appearance, and preferences"
        />

        {error && (
          <div className="bg-[var(--error-10)] border border-[var(--error-20)] rounded-lg p-4 mb-6">
            <p className="text-[var(--error-80)] text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-8 mt-8">
          <AccountSection user={user} subscription={subscriptionData} />
          <CustomizationSection />
          <SecuritySection />
          <SystemSection />
        </div>
      </div>
    </div>
  );
}
