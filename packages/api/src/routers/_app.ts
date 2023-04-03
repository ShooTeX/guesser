import { router } from "../create-router";
import { playlistsRouter } from "./playlists/_router";
import { questionsRouter } from "./questions/_router";

export const appRouter = router({
  playlists: playlistsRouter,
  questions: questionsRouter,
});

export type AppRouter = typeof appRouter;
