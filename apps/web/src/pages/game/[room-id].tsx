import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/trpc";
import type { AppRouter } from "@guesser/api";
import type { inferProcedureOutput } from "@trpc/server";
import type { inferObservableValue } from "@trpc/server/observable";
import { Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

const copyToClipboard = async (value: string) => {
  await navigator.clipboard.writeText(value);
};

const Waiting = ({ roomId }: { roomId: string }) => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input type="password" value={roomId} disabled />
        <Button
          type="button"
          variant="subtle"
          onClick={() => copyToClipboard(roomId)}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function Game() {
  const router = useRouter();
  const roomId = router.query["room-id"] as string | undefined;
  const [data, setData] = useState<
    | inferObservableValue<inferProcedureOutput<AppRouter["game"]["join"]>>
    | undefined
  >(undefined);
  api.game.join.useSubscription(
    { id: roomId || "", userId: "" },
    {
      enabled: !!roomId,
      onData: (data) => {
        setData(data);
      },
      onError: console.error,
    }
  );

  if (!data) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex h-14 items-center space-x-4">
          <Logo />
          <Separator orientation="vertical" />
          <div className="flex items-center">
            <Loader2 className="mr-2 h-10 w-10 animate-spin" />
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Connecting
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (data.state === "waiting") {
    return <Waiting roomId={roomId} />;
  }

  return <div>hello!</div>;
}
