// app/(auth)/oauth-signin.tsx

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface OAuthProviderProps {
  provider: "google" | "github" | "twitter" | "linkedin";
  children: React.ReactNode;
  className?: string;
}

export function OAuthProvider({
  provider,
  children,
  className,
}: OAuthProviderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("OAuth sign in error:", error);
        throw error;
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
          <span>Connecting...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

export function GoogleSignIn({ className }: { className?: string }) {
  return (
    <OAuthProvider
      provider="google"
      className={
        className ||
        "flex items-center justify-center gap-2 p-2 border border-gray-700 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors text-white"
      }
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Google
    </OAuthProvider>
  );
}

export function GithubSignIn({ className }: { className?: string }) {
  return (
    <OAuthProvider
      provider="github"
      className={
        className ||
        "flex items-center justify-center gap-2 p-2 border border-gray-700 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors text-white"
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 1C4.477 1 0 5.477 0 11c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.338-3.369-1.338-.454-1.152-1.11-1.459-1.11-1.459-.908-.619.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.349-1.086.635-1.337-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.022A9.578 9.578 0 0110 6.836c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.934.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 19.163 20 15.418 20 11c0-5.523-4.477-10-10-10z"
          clipRule="evenodd"
        />
      </svg>
      GitHub
    </OAuthProvider>
  );
}
