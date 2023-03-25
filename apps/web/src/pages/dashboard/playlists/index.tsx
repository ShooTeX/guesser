import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { HelpCircle, List, Play, Plus, Trash } from "lucide-react";

import type { WithUserProp } from "@clerk/nextjs";
import { withUser } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "@/lib/trpc";
import { Separator } from "@/components/ui/separator";

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
      <Link href="playlists/create">
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Create Playlist
        </Button>
      </Link>
    </div>
  </div>
);

type ItemProperties = {
  title: string;
  index: number;
  questionCount: number;
  playCount: number;
  id: string;
};

const Item = ({
  title,
  index,
  questionCount,
  playCount,
  id,
}: ItemProperties) => {
  return (
    <div className="rounded-md border border-slate-200 px-4 py-3 text-sm dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex">
            <span className="font-mono font-normal text-slate-500 dark:text-slate-400">
              #{index} -&nbsp;
            </span>
            <p className="font-bold">{title}</p>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            short description
          </p>
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost">
            <Trash className="h-4 w-4" />
          </Button>
          <Link href={`playlists/${id}/`}>
            <Button variant="subtle">Edit</Button>
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
        <p className="shrink-0 self-end text-slate-400 dark:text-slate-600">
          created 2d ago
        </p>
      </div>
    </div>
  );
};

const Playlists = ({ user }: WithUserProp) => {
  const playlists = api.playlists.get.useQuery();

  return (
    <DashboardLayout
      user={user}
      headline="Playlists"
      subline="Create or edit playlists"
      action={
        <Link href="playlists/create">
          <Button>Create</Button>
        </Link>
      }
    >
      {playlists.data?.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-2">
          {/* <Input placeholder="Search..." /> */}
          {playlists.data?.map((playlist, index) => (
            <Item
              id={playlist.id}
              playCount={0}
              index={index}
              title={playlist.name}
              key={playlist.id}
              questionCount={20}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default withUser(Playlists);
