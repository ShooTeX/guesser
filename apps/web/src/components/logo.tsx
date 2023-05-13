import { HelpCircle } from "lucide-react";
import Link from "next/link";

export const Logo = () => (
  <div className="inline-flex cursor-default flex-col items-end">
    <Link href="/">
      <span className="flex items-center justify-center text-2xl font-bold leading-none tracking-tight text-slate-50">
        <HelpCircle className="mr-1" />
        GUESSER
      </span>
    </Link>
    <span className="text-sm text-slate-500">
      by{" "}
      <a href="https://twitter.com/imShooTeX" target="_blank" rel="noreferrer">
        <strong className="tracking-tight">ShooTeX</strong>
      </a>
    </span>
  </div>
);
