import { protectedProcedure, publicProcedure, router } from "../trpc";
import { questions } from "../database/schema";

export const exampleRouter = router({
  getQuestions: publicProcedure.query(({ ctx }) => {
    return ctx.database.select().from(questions);
  }),
  test: protectedProcedure.query(({ ctx }) => {
    return ctx.auth;
  }),
});
