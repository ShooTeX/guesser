import { HelpCircle } from "lucide-react";

export const Logo = () => (
  <div className="inline-flex cursor-default flex-col items-end">
    <span className="flex items-center justify-center text-2xl font-bold leading-none tracking-tight text-slate-50">
      <HelpCircle className="mr-1" />
      GUESSER
    </span>
    <span className="text-sm text-slate-500">
      by{" "}
      <a href="twitter.com/imShooTeX">
        <strong className="tracking-tight">ShooTeX</strong>
      </a>
    </span>
  </div>
);
