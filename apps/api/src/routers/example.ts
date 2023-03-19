import { publicProcedure, router } from "../trpc";
import { newQuestionSchema, questions } from "../database/schema";
import { nanoid } from "nanoid";

export const exampleRouter = router({
  createQuestion: publicProcedure
    .input(newQuestionSchema)
    .mutation(({ ctx, input: { question } }) => {
      return ctx.database.insert(questions).values({ question, id: nanoid() });
    }),
  getQuestions: publicProcedure.query(({ ctx }) => {
    return ctx.database.select().from(questions);
  }),
});
