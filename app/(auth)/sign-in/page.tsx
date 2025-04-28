// app/(auth)/sign-in/page.tsx

import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Link from "next/link";
import { GoogleSignIn, GithubSignIn, TwitterSignIn, LinkedInSignIn } from "../oauth-signin";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <>
      <h1 className="text-2xl font-bold text-white text-center mb-6">
        Sign In
      </h1>

      <form className="flex-1 flex flex-col gap-5 w-full" action={signInAction}>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-gray-300">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-300">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-400 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>

        <SubmitButton
          pendingText="Signing In..."
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Sign In
        </SubmitButton>

        <FormMessage message={searchParams} />

        <div className="mt-4 text-center text-sm text-gray-300">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-blue-400 hover:underline">
            Sign Up
          </Link>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-800 px-2 text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <GoogleSignIn />
          <GithubSignIn />
          <TwitterSignIn />
          <LinkedInSignIn />
        </div>
      </form>
    </>
  );
}