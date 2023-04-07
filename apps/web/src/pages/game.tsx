import { Button } from "@/components/ui/button";
import type { RouterOutput } from "@/lib/trpc";
import { api } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function Game() {
  const [roomId, setRoomId] = useState<string | undefined>();
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
  const createMutation = api.game.createRoom.useMutation({
    onSuccess: setRoomId,
  });
  return (
    <>
      <div>{JSON.stringify(data) || <Loader2 className="animate-spin" />}</div>
      <Button
        onClick={() =>
          createMutation.mutate({ playlistId: "dJRnb3MW-8PnC77OqohfH" })
        }
      >
        Create
      </Button>
    </>
  );
}
