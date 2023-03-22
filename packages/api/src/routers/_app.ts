import { router } from "../create-router";
import { playlistsRouter } from "./playlists";

export const appRouter = router({
  playlists: playlistsRouter,
});

export type AppRouter = typeof appRouter;
