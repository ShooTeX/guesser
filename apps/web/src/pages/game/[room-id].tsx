import { Controls } from "@/components/controls";
import { Logo } from "@/components/logo";
import type { PlayersProperties } from "@/components/players";
import { Players } from "@/components/players";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/trpc";
import { useUser } from "@clerk/nextjs";
import type { AppRouter } from "@guesser/api";
import type { inferProcedureOutput } from "@trpc/server";
import type { inferObservableValue } from "@trpc/server/observable";
import { motion } from "framer-motion";
import { Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const copyToClipboard = async (value: string) => {
  await navigator.clipboard.writeText(value);
};

const Waiting = ({
  roomId,
  players,
  host,
}: {
  roomId: string;
  players: PlayersProperties["players"];
  host: PlayersProperties["host"];
}) => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <Players players={players} host={host} />
      <div className="mt-4 flex w-full max-w-sm items-center space-x-2">
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

type ScreenProperties = {
  data: inferObservableValue<inferProcedureOutput<AppRouter["game"]["join"]>>;
  roomId: string;
};

const Screen = ({ data, roomId }: ScreenProperties) => {
  if (data.state === "waiting") {
    return (
      <Waiting roomId={roomId || ""} players={data.players} host={data.host} />
    );
  }
  return <div>{data.question.question}</div>;
};

export default function Game() {
  const { user } = useUser();
  const router = useRouter();
  const roomId = router.query["room-id"] as string | undefined;
  const [controlsOpen, setControlsOpen] = useState(true);
  const { toast } = useToast();
  const constraintsReference = useRef(null);
  const [data, setData] = useState<
    | inferObservableValue<inferProcedureOutput<AppRouter["game"]["join"]>>
    | undefined
  >(undefined);
  api.game.join.useSubscription(
    { id: roomId || "", userId: user?.id || "" },
    {
      enabled: !!roomId && !!user,
      onData: (data) => {
        setData(data);
      },
      onError: console.error,
    }
  );

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === "k" && event.metaKey) {
        setControlsOpen((open) => !open);
      }
    };

    if (user?.id === data?.host.id) document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [data?.host.id, user?.id]);

  if (!data) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex h-14 items-center space-x-4">
          <Logo />
          <Separator orientation="vertical" />
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Connecting...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleControlsClose = () => {
    setControlsOpen(false);
    toast({
      title: "Host controls hidden",
      description: (
        <span>
          Press{" "}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-100 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-600 opacity-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <span className="text-xs">⌘</span>K
          </kbd>{" "}
          to undo
        </span>
      ),
      action: (
        <ToastAction altText="undo" onClick={() => setControlsOpen(true)}>
          Undo
        </ToastAction>
      ),
    });
  };

  return (
    <div
      className="flex h-screen w-full flex-col items-center justify-center"
      ref={constraintsReference}
    >
      {data.host.id === user?.id && data.hostInfo && controlsOpen && (
        <motion.div
          className="absolute top-4 right-4"
          drag
          dragElastic={false}
          dragMomentum={false}
          dragConstraints={constraintsReference}
        >
          <Controls
            roomId={roomId || ""}
            playlistName={data.hostInfo.playlistName}
            questionsCount={data.hostInfo.questionCount}
            currentQuestion={data.hostInfo.currentQuestion}
            state={data.state}
            onClose={() => handleControlsClose()}
          />
        </motion.div>
      )}
      <Screen data={data} roomId={roomId || ""} />
    </div>
  );
}
