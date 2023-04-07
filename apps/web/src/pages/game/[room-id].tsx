import { Button } from "@/components/ui/button";
import type { RouterOutput } from "@/lib/trpc";
import { api } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Game() {
  const router = useRouter();
  const roomId = router.query["room-id"] as string | undefined;
  const [data, setData] = useState<RouterOutput["game"]["join"] | undefined>(
    undefined
  );
  api.game.join.useSubscription(
    { id: roomId || "", userId: "" },
    {
      enabled: !!roomId,
      onData: (data) => setData(data),
      onError: console.error,
    }
  );
  return (
    <>
      <div>{JSON.stringify(data) || <Loader2 className="animate-spin" />}</div>
      <Button>Create</Button>
    </>
  );
}
