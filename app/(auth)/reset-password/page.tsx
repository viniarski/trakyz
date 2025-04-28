// app/(auth)/reset-password/page.tsx

import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <h1 className="text-2xl font-bold text-white text-center mb-6">
        Reset Password
      </h1>
      <p className="text-gray-400 text-center mb-6">
        Enter your new password below.
      </p>

      <form
        className="flex-1 flex flex-col gap-5 w-full"
        action={resetPasswordAction}
      >
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-gray-300">
            New Password
          </Label>
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

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword" className="text-gray-300">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            minLength={6}
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
