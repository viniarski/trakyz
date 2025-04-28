// app/(auth)/forgot-password/page.tsx

import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Link from "next/link";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <>
      <h1 className="text-2xl font-bold text-white text-center mb-6">
        Reset Password
      </h1>
      <p className="text-gray-400 text-center mb-6">
        Enter your email address and we'll send you a link to reset your
        password.
      </p>

      <form
        className="flex-1 flex flex-col gap-5 w-full"
        action={forgotPasswordAction}
      >
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

        <SubmitButton className="bg-blue-500 hover:bg-blue-600 text-white">
          Reset Password
        </SubmitButton>

        <FormMessage message={searchParams} />

        <div className="mt-4 text-center text-sm text-gray-300">
          Remember your password?{" "}
          <Link href="/sign-in" className="text-blue-400 hover:underline">
            Sign In
          </Link>
        </div>
      </form>
    </>
  );
}
