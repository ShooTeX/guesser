import { DashboardLayout } from "@/components/dashboard-layout";
import type { WithUserProp } from "@clerk/nextjs";
import { withUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HelpCircle, Plus } from "lucide-react";

const PlaylistCreate = ({ user }: WithUserProp) => {
  return (
    <DashboardLayout
      user={user}
      headline="Create Playlist"
      subline="Create a new fancy playlist"
    >
      <div className="grid gap-4 pt-2">
        <div className="grid grid-cols-4 items-center gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            placeholder="Name"
            className="col-span-2"
          />
          <div className="col-span-4 my-4 h-[1px] w-full bg-slate-200 dark:bg-slate-700"></div>
          <Label htmlFor="questions" className="col-start-1 self-start">
            Questions
          </Label>
          <div
            id="questions"
            className="col-span-2 flex h-60 shrink-0 items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-700"
          >
            <div className="mx-auto flex flex-col items-center justify-center text-center">
              <HelpCircle className="h-10 w-10 text-slate-400" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
                No questions created
              </h3>
              <p className="mt-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
                You have no playlists. Add one below.
              </p>
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                Create question
              </Button>
            </div>
          </div>
          <div className="col-span-4 my-4 h-[1px] w-full bg-slate-200 dark:bg-slate-700"></div>
          <div className="col-start-4 flex justify-end space-x-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default withUser(PlaylistCreate);
