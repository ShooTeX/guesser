import { api } from "@/lib/trpc";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { PlaylistSelect } from "./playlist-select";
import { useState } from "react";

export type ControlsProperties = {
  onClose: () => void;
  state: string;
  currentQuestion: number;
  questionsCount: number;
  playlistName: string;
  roomId: string;
};

export const Controls = ({
  onClose,
  state,
  currentQuestion,
  questionsCount,
  playlistName,
  roomId,
}: ControlsProperties) => {
  const [playlistSelectOpen, setPlaylistSelectOpen] = useState(false);
  const continueRoomMutation = api.game.continueRoom.useMutation();
  const nextPlaylistMutation = api.game.nextPlaylist.useMutation();
  return (
    <>
      <PlaylistSelect
        open={playlistSelectOpen}
        onOpenChange={setPlaylistSelectOpen}
        onSelect={(playlistId) => {
          nextPlaylistMutation.mutate({ roomId, playlistId });
          setPlaylistSelectOpen(false);
        }}
      />
      <div className="overflow-hidden rounded-md border border-slate-100 dark:border-slate-600 dark:bg-slate-700">
        <div className="flex justify-center bg-slate-100 py-1 px-4 dark:bg-slate-600">
          <small className="flex-1 text-sm font-medium leading-none">
            Host controls
          </small>
          <X className="h-4 w-4 cursor-pointer" onClick={() => onClose()} />
        </div>
        <div className="flex flex-col gap-4 px-4 py-3 text-sm">
          <div className="grid w-64 grid-cols-3 gap-2">
            <p>Playlist</p>
            <p className="col-span-2 truncate text-right font-semibold">
              {playlistName}
            </p>
            <p>Question</p>
            <p className="col-span-2 text-right">
              <span className="font-semibold">{currentQuestion + 1}</span> of{" "}
              <span className="font-semibold">{questionsCount}</span>
            </p>
            <p>State</p>
            <p className="col-span-2 truncate text-right font-semibold uppercase">
              {state.replace("_", " ")}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {state === "end" ? (
              <Button
                className="w-full"
                type="button"
                onClick={() => {
                  setPlaylistSelectOpen(true);
                }}
              >
                Next playlist
              </Button>
            ) : (
              <Button
                className="w-full"
                type="button"
                onClick={() => {
                  continueRoomMutation.mutate({ id: roomId });
                }}
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
