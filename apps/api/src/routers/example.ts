import { z } from "zod";
import { publicProcedure, router } from "../trpc";

type User = {
  id: string;
  name: string;
  bio?: string;
};
const users: Record<string, User> = {};

export const exampleRouter = router({
  getUserById: publicProcedure.input(z.string()).query(({ input }) => {
    return users[input]; // input type is string
  }),
  createUser: publicProcedure
    .input(
      z.object({
        name: z.string().min(3),
        bio: z.string().max(142).optional(),
      })
    )
    .mutation(({ input }) => {
      const id = Date.now().toString();
      console.log(id);
      const user: User = { id, ...input };
      users[user.id] = user;
      return user;
    }),
});
