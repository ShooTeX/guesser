import { clerkClient } from "@clerk/fastify";
import { observable } from "@trpc/server/observable";
import EventEmitter from "node:events";
import { z } from "zod";
import { publicProcedure, router } from "../../create-router";

const ee = new EventEmitter();

const postSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  user: z.string(),
});

type Post = z.infer<typeof postSchema>;

export const gameRouter = router({
  onAdd: publicProcedure
    .input(z.object({ roomId: z.string(), userId: z.string() }))
    .subscription(async ({ input }) => {
      const user = await clerkClient.users.getUser(input.userId);
      return observable<Post>((emit) => {
        const onAdd = (data: Post) => {
          // emit data to client
          emit.next({
            ...data,
            user: user.username || user.firstName || "null",
          });
        };

        ee.on("add", onAdd);

        return () => {
          ee.off("add", onAdd);
        };
      });
    }),
  add: publicProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        text: z.string().min(1),
      })
    )
    .mutation(({ input }) => {
      const post = { ...input };
      ee.emit("add", post);
      return post;
    }),
});
