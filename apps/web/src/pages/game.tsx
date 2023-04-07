import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function Game() {
  const { user, isLoaded } = useUser();
  const [data, setData] = useState("");
  api.game.onAdd.useSubscription(
    { userId: user?.id || "", roomId: "asdf" },
    {
      onData: (data) => setData(data.user),
      enabled: isLoaded,
    }
  );
  const mutation = api.game.add.useMutation();
  return (
    <div>
      {data}
      <Button
        onClick={() =>
          mutation.mutate({
            text: (Math.random() + 1).toString(36).slice(7),
          })
        }
      >
        Test
      </Button>
    </div>
  );
}
