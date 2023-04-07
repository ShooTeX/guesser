import { Button } from "@/components/ui/button";
import type { RouterOutput } from "@/lib/trpc";
import { api } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function Game() {
  const [data, setData] = useState<RouterOutput["game"]["join"] | undefined>(
    undefined
  );
  api.game.join.useSubscription(undefined, {
    onData: (data) => setData(data),
  });
  const mutation = api.game.continue.useMutation();
  return (
    <>
      <div>{JSON.stringify(data) || <Loader2 className="animate-spin" />}</div>
      <Button onClick={() => mutation.mutate()}>Continue</Button>
    </>
  );
}
