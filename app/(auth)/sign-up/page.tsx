import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { GoogleSignIn, GithubSignIn } from "../oauth-signin";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="flex-1 flex items-center justify-center gap-2">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white text-center mb-6">Create an Account</h1>
      
      <form className="flex-1 flex flex-col gap-5 w-full" action={signUpAction}>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-gray-300">Email</Label>
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
          <Label htmlFor="password" className="text-gray-300">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={6}
            className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>

        <SubmitButton pendingText="Signing Up..." className="bg-blue-500 hover:bg-blue-600 text-white">
          Sign Up
        </SubmitButton>

        <FormMessage message={searchParams} />

        <div className="mt-4 text-center text-sm text-gray-300">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-blue-400 hover:underline">
            Sign In
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

        <div className="grid grid-cols-2 gap-4">
          <GoogleSignIn />
          <GithubSignIn />
        </div>

        <p className="text-xxs text-gray-400 text-center mt-4">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-blue-400 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-blue-400 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </form>
    </>
  );
}