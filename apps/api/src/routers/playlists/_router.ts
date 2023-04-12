import { get } from "./procedures/get";
import { create } from "./procedures/create";
import { edit } from "./procedures/edit";
import { remove } from "./procedures/remove";
import { incrementPlayCount } from "./procedures/increment-play-count";
import { router } from "@/trpc/create-router";

export const playlistsRouter = router({
  get,
  create,
  edit,
  remove,
  incrementPlayCount,
});
