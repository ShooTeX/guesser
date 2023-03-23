import { DashboardLayout } from "@/components/dashboard-layout";
import type { WithUserProp } from "@clerk/nextjs";
import { withUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HelpCircle, Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/trpc";
import { useRouter } from "next/router";

const questionSchema = z.object({
  id: z.string().length(21),
  userId: z.string(),
  question: z.string().min(1),
  playlistId: z.string().length(21),
  createdAt: z.date(),
});

const playlistSchema = z.object({
  id: z.string().length(21),
  userId: z.string(),
  name: z.string().min(1),
  createdAt: z.date(),
});

const createPlaylistSchema = playlistSchema.pick({ name: true }).extend({
  questions: questionSchema.pick({ question: true }).array().optional(),
});

const PlaylistCreate = ({ user }: WithUserProp) => {
  const router = useRouter();
  const mutation = api.playlists.create.useMutation({
    onSuccess: () => {
      router.back();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<z.infer<typeof createPlaylistSchema>>({
    resolver: zodResolver(createPlaylistSchema),
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <DashboardLayout
      user={user}
      headline="Create Playlist"
      subline="Create a new fancy playlist"
    >
      <form className="grid gap-4 pt-2" onSubmit={onSubmit}>
        <div className="grid grid-cols-4 items-center gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            placeholder="Name"
            className="col-span-2"
            {...register("name")}
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
            <Button type="submit" disabled={mutation.isLoading || !isValid}>
              {mutation.isLoading && (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default withUser(PlaylistCreate);
