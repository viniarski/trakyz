import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen">
      {/* Header with sign out button */}
      <header className="border-b py-4">
        <div className="container flex justify-between items-center">
          <Link href="/protected" className="flex items-center gap-2 text-2xl font-bold">
            <div className="relative h-6 w-6">
              <Image 
                src="/logo_trakyz.png"
                alt="Trakyz Logo" 
                fill
                sizes="24px"
                className="object-contain object-left"
                priority
              />
            </div>
            TRAKYZ
          </Link>
          
          <div className="flex items-center gap-4">
            {user && (
              <p className="text-muted-foreground hidden sm:block">
                Welcome, {user.email}
              </p>
            )}
            <form action={signOutAction}>
              <Button type="submit" variant="outline">Sign out</Button>
            </form>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 container py-8">
        <div className="w-full mb-8">
          <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
            <InfoIcon size="16" strokeWidth={2} />
            This is a protected page that you can only see as an authenticated
            user
          </div>
        </div>
        
        <div className="flex flex-col gap-2 items-start mb-8">
          <h2 className="font-bold text-2xl mb-4">User details</h2>
          <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto w-full">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
      </div>
    </div>
  );
}