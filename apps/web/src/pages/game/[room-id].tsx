import { Controls } from "@/components/controls";
import { Logo } from "@/components/logo";
import type { PlayersProperties } from "@/components/players";
import { Players } from "@/components/players";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import type { AppRouter } from "@guesser/api";
import type { inferProcedureOutput } from "@trpc/server";
import type { inferObservableValue } from "@trpc/server/observable";
import type { Variants } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Balancer from "react-wrap-balancer";
import { groupBy, pipe } from "remeda";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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
  const shareLink = `https://${
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "localhost:3000"
  }/game/${roomId}`;
  const slHiddenCode = `https://${
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "localhost:3000"
  }/game/${roomId.replace(/./g, "•")}`;
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <Players players={players} host={host} />
      <div className="mt-4 flex w-full max-w-sm items-center space-x-2">
        <Input value={slHiddenCode} className="pointer-events-none" disabled />
        <Button
          type="button"
          variant="subtle"
          onClick={() => copyToClipboard(shareLink)}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

type PlayingProperties = ScreenProperties;

const Playing = ({ data, roomId }: PlayingProperties) => {
  const { user } = useUser();

  const isHost = user?.id === data.host.id;
  const userGuess = data.players.find(
    (player) => player.id === user?.id
  )?.guess;

  const guessMutation = api.game.guess.useMutation();

  const handleGuess = (id: string) => {
    guessMutation.mutate({ id, roomId });
  };

  const guesses = pipe(
    data.players,
    groupBy((player) => player.guess || "dq")
  );

  const answerContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0,
        delay: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.5,
      },
    },
    exit: { opacity: 0 },
  };

  const answerItemVariants: Variants = {
    hidden: { opacity: 0, x: 10 },
    show: {
      opacity: 1,
      x: 0,
    },
  };

  const questionVariants: Variants = {
    hidden: { opacity: 0, y: -50 },
    show: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
    },
  };

  const markdown = `
\`\`\`ts
type lul = "hello";
const test: Type = "hello";
const test = "hello";
const test = "hello";
const test = "hello";
const test = "hello";
const test = "hello";
const test = "hello";
\`\`\``;

  return (
    <div className="flex w-[800px] flex-col justify-center">
      <Players players={data.players} host={data.host} />
      <div className="flex min-h-full items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={data.question.id}
            variants={questionVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <h1 className="scroll-m-20 text-center text-2xl font-semibold tracking-tight">
              <Balancer>{data.question.question}</Balancer>
            </h1>
            <div className="prose prose-invert prose-pre:bg-transparent prose-pre:p-0 mt-4">
              <ReactMarkdown
                components={{
                  code({ inline, className, children, ...properties }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        {...properties}
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code {...properties} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={data.question.id}
          className="grid grid-cols-2 gap-4"
          variants={answerContainerVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {data.answers.map((answer) => (
            <motion.div
              className="relative"
              variants={answerItemVariants}
              key={answer.id}
            >
              <div className="absolute left-2 -top-3 z-10 flex gap-1">
                {data.state === "revealing_answer" &&
                  guesses?.[answer.id]?.map((player) => (
                    <Avatar className="h-6 w-6" key={player.id}>
                      <AvatarImage src={player.avatar} />
                      <AvatarFallback>{player.username[0]}</AvatarFallback>
                    </Avatar>
                  ))}
              </div>
              <Button
                size="lg"
                onClick={() => handleGuess(answer.id)}
                variant={
                  data.state === "revealing_answer" || userGuess === answer.id
                    ? "subtle"
                    : "outline"
                }
                disabled={
                  data.state === "revealing_answer"
                    ? data.correctAnswer !== answer.id
                    : !!userGuess && userGuess !== answer.id
                }
                className={cn(
                  "w-full",
                  (isHost || userGuess) && "pointer-events-none",
                  data.correctAnswer === answer.id &&
                    "bg-green-700 font-bold dark:bg-green-700 pointer-events-none"
                )}
              >
                {answer.answer}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const End = ({ data }: ScreenProperties) => {
  return <Players players={data.players} host={data.host} />;
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

  if (data.state === "end") {
    return <End data={data} roomId={roomId} />;
  }

  return <Playing data={data} roomId={roomId} />;
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
