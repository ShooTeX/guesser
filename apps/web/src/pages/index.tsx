import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className="flex h-screen w-full items-center justify-center">
        <div className="flex h-14 items-center space-x-4">
          <Logo />
          <Separator orientation="vertical" />
          <Link href="/sign-in">
            <Button size="lg">Login</Button>
          </Link>
        </div>
      </main>
    </>
  );
}
