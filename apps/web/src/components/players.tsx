import type { gameSchema } from "@guesser/schemas";
import type { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { WifiOff } from "lucide-react";

export type PlayersProperties = {
  players: z.infer<typeof gameSchema>["players"];
  host: z.infer<typeof gameSchema>["host"];
};

export const Players = ({ players, host }: PlayersProperties) => {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={host.avatar} alt={host.username} />
          <AvatarFallback>{host.username[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-center">
          <span className="text-lg font-semibold leading-tight text-slate-900 dark:text-slate-50">
            {host.username}
          </span>
          <span className="text-sm leading-tight text-slate-500 dark:text-slate-400">
            host
          </span>
        </div>
      </div>
      {players.length > 0 && <Separator orientation="vertical" />}
      {players.map((player) => (
        <div key={player.id} className="flex items-center gap-2">
          <Avatar>
            {player.connected ? (
              <>
                <AvatarImage src={player.avatar} alt={player.username} />
                <AvatarFallback>{player.username[0]}</AvatarFallback>
              </>
            ) : (
              <>
                <AvatarImage src="" alt={player.username} />
                <AvatarFallback className="dark:bg-red-500">
                  <WifiOff className="dark:text-red-100" />
                </AvatarFallback>
              </>
            )}
          </Avatar>
          <div className="flex flex-col justify-center">
            <span className="text-lg font-semibold leading-tight text-slate-900 dark:text-slate-50">
              {player.username}
            </span>
            <span className="text-sm leading-tight text-slate-500 dark:text-slate-400">
              {player.score}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
