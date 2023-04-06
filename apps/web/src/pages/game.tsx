import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc";
import { useState } from "react";

export default function Game() {
  const [data, setData] = useState("");
  api.game.onAdd.useSubscription(undefined, {
    onData: (data) => setData(data.text),
  });
  const mutation = api.game.add.useMutation();
  return (
    <div>
      {data}
      <Button onClick={() => mutation.mutate({ text: "hello!" })}>Test</Button>
    </div>
  );
}
