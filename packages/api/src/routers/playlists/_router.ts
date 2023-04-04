import { router } from "../../create-router";
import { get } from "./procedures/get";
import { create } from "./procedures/create";
import { edit } from "./procedures/edit";
import { remove } from "./procedures/remove";
import { incrementPlayCount } from "./procedures/increment-play-count";

export const playlistsRouter = router({
  get,
  create,
  edit,
  remove,
  incrementPlayCount,
});
