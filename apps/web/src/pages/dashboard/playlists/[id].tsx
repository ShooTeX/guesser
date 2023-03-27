import { DashboardLayout } from "@/components/dashboard-layout";
import type { WithUserProp } from "@clerk/nextjs";
import { withUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HelpCircle, Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RouterOutput } from "@/lib/trpc";
import { api } from "@/lib/trpc";
import { useRouter } from "next/router";
import { Separator } from "@/components/ui/separator";
import { editPlaylistSchema } from "@/lib/schemas/playlists";
import type { z } from "zod";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
      router.back();
    },
  });

  console.log(playlist);

  const {
    handleSubmit,
    register,
    formState: { isValid },
  } = useForm<z.infer<typeof editPlaylistSchema>>({
    resolver: zodResolver(editPlaylistSchema),
    defaultValues: {
      id: playlist.id,
      input: {
        name: playlist.name,
      },
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid grid-cols-4 items-start gap-2">
        <Label htmlFor="general">General</Label>
        <div id="general" className="col-span-2 flex flex-col gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              placeholder="Name"
              {...register("input.name")}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="short-desc">Short description</Label>
            <Input
              type="text"
              id="short-desc"
              placeholder="Awesome playlist..."
            />
          </div>
        </div>
        <Separator className="col-span-4 my-4 w-full" />
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
  );
};

const Questions = () => {
  return (
    <div className="col-span-2 flex h-80 shrink-0 items-center justify-center">
      <div className="mx-auto flex flex-col items-center justify-center text-center">
        <HelpCircle className="h-10 w-10 text-slate-400" />
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
          No questions created
        </h3>
        <p className="mt-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
          You have no questions. Add one below.
        </p>
        <Sheet>
          <SheetTrigger>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              Create question
            </Button>
          </SheetTrigger>
          <SheetContent size="content">
            <SheetHeader>New question</SheetHeader>
            <SheetDescription>Add a new question</SheetDescription>
            <Separator className="my-4" />
            <div className="flex w-80 flex-col gap-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="message">Question</Label>
                <Textarea
                  placeholder="What's the best programming language?"
                  id="message"
                />
              </div>
              <RadioGroup defaultValue="option-one">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option-one" id="option-one" />
                  <Input placeholder="Answer..." />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option-two" id="option-two" />
                  <Input />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option-three" id="option-two" />
                  <Input />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option-four" id="option-two" />
                  <Input />
                </div>
              </RadioGroup>
            </div>
            <Separator className="my-4" />
            <SheetFooter>
              <Button variant="ghost">Cancel</Button>
              <Button>Create</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

const PlaylistCreate = ({ user }: WithUserProp) => {
  const router = useRouter();
  const playlist = api.playlists.get.useQuery(
    {
      id: router.query.id as string,
    },
    {
      enabled: !!router.query.id,
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
      user={user}
      headline="Edit Playlist"
      subline="Change name, description and add/remove questions"
    >
      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
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
        <TabsContent value="questions">
          <Questions />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default withUser(PlaylistCreate);
