import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import { HelpCircle, List, Play, Plus } from "lucide-react";

const Dashboard = () => {
  const { user } = useUser();
  if (!user) {
    return;
  }

  return (
    <div className="grid grid-cols-4 xl:grid-cols-6">
      <aside className="border-r border-r-slate-200 pb-12 dark:border-r-slate-700">
        <div className="px-8 py-6">
          <div className="inline-flex flex-col items-end">
            <span className="flex items-center justify-center text-2xl font-bold leading-none tracking-tight text-slate-50">
              <HelpCircle className="mr-1" />
              GUESSER
            </span>
            <span className="text-sm text-slate-500">
              by <strong className="tracking-tight">ShooTeX</strong>
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="px-8 py-6">
            <Button className="w-full uppercase">
              <Play className="mr-2 h-4 w-4" />
              new game
            </Button>
          </div>
          <div className="px-8 py-6">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              Manage
            </h2>
            <div className="mt-1 space-y-1">
              <Button variant="subtle" className="w-full justify-start">
                <List className="mr-2 h-4 w-4" />
                Playlists
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <HelpCircle className="mr-2 h-4 w-4" />
                Questions
              </Button>
            </div>
          </div>
        </div>
      </aside>
      <div className="col-span-3 m-auto h-full w-full max-w-5xl px-8 py-6 xl:col-span-5">
        <div className="flex items-center justify-end">
          <span className="mr-2 text-sm">
            Hey <strong>{user.firstName}</strong>
          </span>
          <UserButton />
        </div>
        <div className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">Playlists</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create or edit your playlists.
          </p>
        </div>
        <div className="my-4 h-[1px] w-full bg-slate-200 dark:bg-slate-700"></div>
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
      </div>
    </div>
  );
};

export default Dashboard;

