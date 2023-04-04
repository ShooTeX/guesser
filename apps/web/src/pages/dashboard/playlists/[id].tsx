import { DashboardLayout } from "@/components/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RouterOutput } from "@/lib/trpc";
import { api } from "@/lib/trpc";
import { useRouter } from "next/router";
import { Separator } from "@/components/ui/separator";
import type { z } from "zod";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QuestionsList } from "@/components/questions-list";
import { editPlaylistSchema } from "@guesser/schemas";

const Settings = ({
  playlist,
}: {
  playlist: RouterOutput["playlists"]["get"][0];
}) => {
  const utils = api.useContext();
  const router = useRouter();
  const mutation = api.playlists.edit.useMutation({
    onSuccess: async () => {
      await utils.playlists.get.invalidate({ id: playlist.id });
      await router.replace("playlists");
    },
  });

  const deleteMutation = api.playlists.remove.useMutation({
    onSuccess: async () => {
      await utils.playlists.get.invalidate({ id: playlist.id });
      await router.replace("playlists");
    },
  });

  const {
    handleSubmit,
    register,
    formState: { isValid },
  } = useForm<z.infer<typeof editPlaylistSchema>>({
    resolver: zodResolver(editPlaylistSchema),
    defaultValues: {
      id: playlist.id,
      name: playlist.name,
      shortDesc: playlist.shortDesc,
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

  return (
    <form className="grid grid-cols-4 items-start gap-4" onSubmit={onSubmit}>
      <Label htmlFor="general">General</Label>
      <div id="general" className="col-span-2 flex flex-col gap-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            placeholder="Name"
            {...register("name")}
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="short-desc">Short description</Label>
          <Input
            type="text"
            id="short-desc"
            placeholder="Awesome playlist..."
            {...register("shortDesc")}
          />
        </div>
      </div>
      <Separator className="col-span-4 w-full" />
      <div>
        <Label htmlFor="danger" className="text-red-600">
          Danger
        </Label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your hard work will be deleted forever :(
        </p>
      </div>
      <div id="danger" className="col-span-2 flex flex-col gap-4">
        <div className="grid w-full items-center gap-1.5 rounded-md border border-red-600 p-4">
          <p className="text-sm text-red-500 dark:text-red-600">
            You can <span className="font-bold uppercase">not</span> undo this
            action!
          </p>
          <div className="flex w-full justify-end">
            <Button
              variant="destructive"
              type="button"
              disabled={deleteMutation.isLoading}
              onClick={() => handleDelete(playlist.id)}
            >
              {deleteMutation.isLoading && (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              )}
              Remove
            </Button>
          </div>
        </div>
      </div>
      <Separator className="col-span-4 w-full" />
      <div className="col-start-4 flex justify-end space-x-2">
        <Button type="submit" disabled={mutation.isLoading || !isValid}>
          {mutation.isLoading && (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          )}
          Save
        </Button>
      </div>
    </form>
  );
};

const PlaylistEdit = () => {
  const router = useRouter();
  const { id } = router.query;
  const playlist = api.playlists.get.useQuery(
    {
      id: id as string,
    },
    {
      enabled: !!id,
      retry: false,
      select: (data) => {
        return data[0];
      },
    }
  );

  if (playlist.error) {
    void router.replace("/dashboard/playlists/");
  }

  return (
    <DashboardLayout
      headline="Edit Playlist"
      subline="Change name, description and add/remove questions"
    >
      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="questions" disabled={!playlist.data}>
            Questions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="settings">
          {playlist.data ? (
            <Settings playlist={playlist.data} />
          ) : (
            <div className="flex justify-center">
              <Loader2 className="animate-spin" />
            </div>
          )}
        </TabsContent>
        <TabsContent value="questions" className="border-none p-0">
          {playlist.data && <QuestionsList playlistId={playlist.data.id} />}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PlaylistEdit;
