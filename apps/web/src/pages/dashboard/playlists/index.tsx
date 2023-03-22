import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { List, Plus } from "lucide-react";

import type { WithUserProp } from "@clerk/nextjs";
import { withUser } from "@clerk/nextjs";

const Playlists = ({ user }: WithUserProp) => {
  return (
    <DashboardLayout
      user={user}
      headline="Playlists"
      subline="Create or edit playlists"
    >
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-700">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <List className="h-10 w-10 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
            No playlists created
          </h3>
          <p className="mt-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
            You have no playlists. Add one below.
          </p>
          <Button>
            <Plus className="h-4 w-4" />
            Create Playlist
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default withUser(Playlists);
