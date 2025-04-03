import Link from "next/link";
import Image from "next/image";
import { signOutAction } from "@/app/actions";
import { Button } from "./ui/button";
import { User } from "@supabase/supabase-js";

interface UserProps {
  user: User | null;
}

const Header: React.FC<UserProps> = ({ user }) => {
  return (
    <header className="border-b py-4">
      <div className="container flex justify-between items-center">
        <Link
          href="/protected"
          className="flex items-center gap-2 text-2xl font-bold"
        >
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
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;
