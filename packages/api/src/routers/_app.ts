import { router } from "../create-router";
import { playlistsRouter as playlists } from "./playlists/_router";
import { questionsRouter as questions } from "./questions/_router";

export const appRouter = router({
  playlists,
  questions,
});

export type AppRouter = typeof appRouter;
