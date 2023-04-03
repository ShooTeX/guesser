import { router } from "../../create-router";
import { get } from "./procedures/get";
import { create } from "./procedures/create";
import { edit } from "./procedures/edit";
import { remove } from "./procedures/remove";

export const playlistsRouter = router({
  get,
  create,
  edit,
  remove,
});
