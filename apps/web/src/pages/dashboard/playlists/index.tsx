import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { List, Plus } from "lucide-react";

import type { WithUserProp } from "@clerk/nextjs";
import { withUser } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "@/lib/trpc";

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
};

const Item = ({ title }: ItemProperties) => {
  return (
    <div className="rounded-md border border-slate-200 px-4 py-3 text-sm font-bold dark:border-slate-700">
      {title}
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
    >
      {playlists.data?.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-2">
          {playlists.data?.map((playlist) => (
            <Item title={playlist.name} key={playlist.id} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default withUser(Playlists);
