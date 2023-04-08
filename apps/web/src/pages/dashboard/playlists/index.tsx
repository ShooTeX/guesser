import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { HelpCircle, List, Loader2, Play, Plus } from "lucide-react";
import Link from "next/link";
import type { RouterOutput } from "@/lib/trpc";
import { api } from "@/lib/trpc";
import { Separator } from "@/components/ui/separator";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import type { PropsWithChildren } from "react";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPlaylistSchema } from "@guesser/schemas";
import type { z } from "zod";
import { useRouter } from "next/router";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

const CreateForm = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<z.infer<typeof createPlaylistSchema>>({
    resolver: zodResolver(createPlaylistSchema),
  });

  const mutation = api.playlists.create.useMutation({
    onSuccess: async (data) => {
      await router.push(`playlists/${data.id}`);
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent size="sm">
        <SheetHeader>
          <SheetTitle>Create playlist</SheetTitle>
          <SheetDescription>
            Create your playlist. You can add questions afterwards.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-4 py-4" onSubmit={onSubmit}>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" className="col-span-3" {...register("name")} />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="shortDesc">Short description</Label>
              <Input
                id="shortDesc"
                className="col-span-3"
                {...register("shortDesc")}
              />
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" disabled={!isValid || mutation.isLoading}>
              {mutation.isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

const Empty = () => (
  <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-700">
    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
      <List className="h-10 w-10 text-slate-400" />
      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
        No playlists created
      </h3>
      <p className="mt-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
        You have no playlists. Add one below.
      </p>
      <CreateForm>
        <Button type="button">
          <Plus className="mr-1 h-4 w-4" />
          Create Playlist
        </Button>
      </CreateForm>
    </div>
  </div>
);

const Item = ({
  name,
  questionCount,
  shortDesc,
  playCount,
  createdAt,
  id,
}: RouterOutput["playlists"]["get"][0]) => {
  return (
    <div className="rounded-md border border-slate-200 px-4 py-3 text-sm dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex">
            <p className="font-bold">{name}</p>
          </div>
          <p className="truncate whitespace-nowrap text-slate-500 dark:text-slate-400">
            {shortDesc || `\u00A0`}
          </p>
        </div>
        <div className="flex space-x-1">
          <Link href={`playlists/${id}/`}>
            <Button variant="subtle" type="button">
              Edit
            </Button>
          </Link>
        </div>
      </div>
      <Separator className="my-2" />
      <div className="flex justify-between">
        <div className="grid w-32 grid-cols-2">
          <div className="mt-1 flex items-center text-slate-500 dark:text-slate-400">
            <HelpCircle className="mr-1 h-4 w-4" />
            <p className="font-mono">{questionCount}</p>
          </div>
          <div className="mt-1 flex items-center text-slate-500 dark:text-slate-400">
            <Play className="mr-1 h-4 w-4" />
            <p className="font-mono">{playCount}</p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <p className="shrink-0 self-end text-slate-300 dark:text-slate-500">
                created {dayjs(createdAt).fromNow()}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{dayjs(createdAt).format("llll")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

const Playlists = () => {
  const playlists = api.playlists.get.useQuery();

  return (
    <DashboardLayout
      headline="Playlists"
      subline="Create or edit playlists"
      action={
        <CreateForm>
          <Button>Create</Button>
        </CreateForm>
      }
    >
      {playlists.data?.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-4">
          {playlists.data?.map((playlist) => (
            <Item {...playlist} key={playlist.id} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Playlists;
