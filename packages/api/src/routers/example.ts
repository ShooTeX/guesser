import { protectedProcedure, router } from "../create-router";

export const exampleRouter = router({
  test: protectedProcedure.query(({ ctx }) => {
    return ctx.auth;
  }),
});
