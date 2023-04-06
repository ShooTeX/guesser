import { router } from "../create-router";
import { gameRouter as game } from "./game/_router";
import { playlistsRouter as playlists } from "./playlists/_router";
import { questionsRouter as questions } from "./questions/_router";

export const appRouter = router({
  playlists,
  questions,
  game,
});

export type AppRouter = typeof appRouter;
