import { Settings2, X } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export type ControlsProperties = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const Controls = ({ open, onOpen, onClose }: ControlsProperties) => {
  if (!open) {
    return (
      <Button
        variant="outline"
        className="w-10 rounded-full p-0"
        onClick={() => onOpen()}
        type="button"
      >
        <Settings2 className="h-4 w-4" />
      </Button>
    );
  }
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex justify-center bg-slate-200 py-1 px-4 dark:bg-slate-700">
        <small className="flex-1 text-sm font-medium leading-none">
          Host controls
        </small>
        <X className="h-4 w-4 cursor-pointer" onClick={() => onClose()} />
      </div>
      <div className="flex flex-col gap-4 px-4 py-3 text-sm">
        <div className="grid w-64 grid-cols-2 gap-2">
          <p>Playlist</p>
          <p className="truncate text-right font-semibold">Awesome Playlist</p>
          <p>Question</p>
          <p className="text-right">
            <span className="font-semibold">1</span> of{" "}
            <span className="font-semibold">20</span>
          </p>
          <p>State</p>
          <p className="truncate text-right font-semibold">Some State</p>
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <Button className="w-full" type="button">
            Continue
          </Button>
          <Button className="w-full" type="button" variant="subtle">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};
