import { api } from "@/lib/trpc";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

export function PlaylistSelect({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (id: string) => void;
}) {
  const { data } = api.playlists.get.useQuery(undefined, { enabled: open });
  const playablePlaylists = data?.filter(
    (playlist) => playlist.questionCount > 0
  );
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search playlist..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Playlists">
          {playablePlaylists?.map((playlist) => (
            <CommandItem
              key={playlist.id}
              className="cursor-pointer"
              onSelect={() => onSelect && onSelect(playlist.id)}
            >
              <div className="grid w-full grid-cols-2 gap-4">
                <span className="flex-1 whitespace-nowrap font-bold">
                  {playlist.name}
                </span>
                <span className="truncate whitespace-nowrap text-end">
                  {playlist.shortDesc}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
