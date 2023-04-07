import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc";
import type { AppRouter } from "@guesser/api";
import type { inferProcedureOutput } from "@trpc/server";
import type { inferObservableValue } from "@trpc/server/observable";
import { useRouter } from "next/router";
import { useState } from "react";

const Waiting = () => {
  return <div>hello!</div>;
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

  return (
    <>
      {data?.state === "waiting" && <Waiting />}
      <Button>Create</Button>
    </>
  );
}
