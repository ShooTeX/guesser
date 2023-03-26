import { router } from "../create-router";
import { playlistsRouter } from "./playlists";
import { questionsRouter } from "./questions/router";

export const appRouter = router({
  playlists: playlistsRouter,
  questions: questionsRouter,
});

export type AppRouter = typeof appRouter;
